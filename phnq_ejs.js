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
				var lBuf = [];
				lines = str.split("\n");
				for(var i=0; i<lines.length; i++)
				{
					lBuf.push(lines[i].trim());
				}
				str = lBuf.join("\n");
			}

			var buf = [];
			buf.push("(function(locals){");
			buf.push("var _out=[];");
			buf.push("with(locals||{}){");
			var m;
			var idx = 0;
			while((m = ESC_REGEX.exec(str)))
			{
				buf.push("_out.push(\""+phnq_core.escapeJS(str.substring(idx, m.index))+"\");");
				if(m[1])
				{
					buf.push("_out.push("+m[2].trim()+");");
				}
				else
				{
					buf.push(m[2].trim());
				}
				idx = ESC_REGEX.lastIndex;
			}
			buf.push("_out.push(\""+phnq_core.escapeJS(str.substring(idx))+"\");}");
			buf.push("return _out.join(\"\");})");
			return buf.join("");
		}
	};

	module.exports = phnq_ejs;
});
