require("phnq_log").exec("phnq_ejs", function(log)
{
	var phnq_core = require("phnq_core");

	phnq_core.assertServer();

	var ESC_REGEX = /<%(=)?([^%]*)%>\n?/g;

	var phnq_ejs =
	{
		compile: function(str, options)
		{
			options = options || {};
			options.trimLines = options.trimLines == undefined ? true : options.trimLines;

			// Trim leading and trailing whitespace from each line, then add a new-line char.
			if(options.trimLines)
			{
				str = phnq_core.trimLines(str);
			}

			var buf = [];
			buf.push("(function(locals){");
			buf.push("var _buf=[];");
			buf.push("with(locals||{}){");
			buf.push("var _out=function(expr, noEval){");
			buf.push("try{_buf.push(noEval?expr:eval(expr));}");
			buf.push("catch(ex){_buf.push('[error:'+ex.message+']');}");
			buf.push("};");
			var m;
			var idx = 0;
			while((m = ESC_REGEX.exec(str)))
			{
				buf.push("_out(\""+phnq_core.escapeJS(str.substring(idx, m.index))+"\", true);");
				if(m[1])
				{
					var exprStr = "\"" + phnq_core.escapeJS(m[2].trim()) + "\"";
					buf.push("_out("+exprStr+");");
				}
				else
				{
					buf.push(m[2].trim());
				}
				idx = ESC_REGEX.lastIndex;
			}
			buf.push("_out(\""+phnq_core.escapeJS(str.substring(idx))+"\", true);}");
			buf.push("return _buf.join(\"\");})");
			return buf.join("");
		}
	};

	module.exports = phnq_ejs;
});
