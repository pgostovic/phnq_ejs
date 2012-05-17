require("phnq_log").exec("phnq_ejs", function(log)
{
	var phnq_core = require("phnq_core");

	phnq_core.assertServer();

	var ESC_REGEX = /<%(=)?(.*?)%>\n?/g;

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
			buf.push("(function(me){");
			buf.push("var _buf=[];");
			buf.push("with(me||{}){");
			buf.push("var _out=function(str){_buf.push(str)};");

			var m;
			var s;
			var idx = 0;
			while((m = ESC_REGEX.exec(str)))
			{
				s = phnq_core.escapeJS(str.substring(idx, m.index));
				buf.push(s ? "_out(\""+s+"\");" : "");

				s = m[2].trim();
				if(s)
				{
					if(m[1])
						buf.push("_out("+s+");");
					else
						buf.push(s);
				}
				idx = ESC_REGEX.lastIndex;
			}
			s = phnq_core.escapeJS(str.substring(idx));
			buf.push(s ? "_out(\""+s+"\");" : "");
			buf.push("}")
			buf.push("return _buf.join(\"\");})");
			return buf.join("");
		}
	};

	module.exports = phnq_ejs;
});
