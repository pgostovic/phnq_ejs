require("phnq_log").exec("phnq_ejs", function(log)
{
	var phnq_core = require("phnq_core");

	phnq_core.assertServer();

	var ESC_REGEX = /<%(=)?([\s\S]*?)%>\n?/g;
	var BODY_FN_REGEX = /([\s,])function\(([^)]*)\)\s*\{\s*$/;

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
			buf.push("me = me || {};");
			buf.push("var _b=[];");
			buf.push("var _i=0;");
			buf.push("with(me){");

			var m;
			var s;
			var idx = 0;
			while((m = ESC_REGEX.exec(str)))
			{
				s = phnq_core.escapeJS(str.substring(idx, m.index));
				buf.push(s ? "_b[_i++]=\""+s+"\";" : "");

				s = m[2].trim();
				if(s)
				{
					// If it's a <%= %> expression then add the result to the buf
					if(m[1])
						buf.push("_b[_i++]=");

					var bm = BODY_FN_REGEX.exec(s);
					if(bm)
					{
						buf.push(s.substring(0, bm.index));
						buf.push(bm[1]);
						buf.push("function(_b){var _i=0;");
					}
					else
					{
						buf.push(s);
						if(m[1])
							buf.push(";");
					}
				}
				idx = ESC_REGEX.lastIndex;
			}
			s = phnq_core.escapeJS(str.substring(idx));
			buf.push(s ? "_b[_i++]=\""+s+"\";" : "");
			buf.push("}");
			buf.push("return _b.join(\"\");})");
			return buf.join("");
		}
	};

	module.exports = phnq_ejs;
});
