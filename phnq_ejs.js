require("phnq_log").exec("phnq_ejs", function(log)
{
	var phnq_core = require("phnq_core");

	phnq_core.assertServer();

	var ESC_REGEX = /<%(=)?([\s\S]*?)%>/g;
	var BODY_FN_REGEX = /([\s,])?function\(([^)]*)\)\s*\{\s*$/;

	var phnq_ejs =
	{
		compile: function(str, options)
		{
			options = options || {};
			options.trimLines = options.trimLines == undefined ? true : options.trimLines;
			options.expressions = options.expressions == undefined ? true : options.expressions;

			// Trim leading and trailing whitespace from each line, then add a new-line char.
			if(options.trimLines)
				str = phnq_core.trimLines(str, true);

			if(options.expressions)
				str = processExpressions(str);

			// console.log("EJS: ", str);

			var buf = [];
			buf.push("(function(_locals, _this){");
			buf.push("_locals = _locals || {};");
			buf.push("_this = _this || _locals;");
			buf.push("var _b=[];");
			buf.push("var _i=0;");
			buf.push("(function(){");
			buf.push("with(_locals){");

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
			buf.push("}).call(_this);");
			buf.push("return _b.join(\"\");})");
			return buf.join("");
		}
	};

	module.exports = phnq_ejs;
});

var processExpressions = function(ejs)
{
	return processStructures(processLiterals(ejs));
};

var EXP_LITERALS_REGEX = /\$\{(.*?)\}/g
var processLiterals = function(ejs)
{
	return ejs.replace(EXP_LITERALS_REGEX, function(match, $1, offset, orig)
	{
		return "<%="+$1+"%>";
	});
};

var DOUBLE_BRACES_REGEX = /\{\{(.*)(\}{2,})/g;
var replaceDoubleBraces = function(ejs)
{
	return ejs.replace(DOUBLE_BRACES_REGEX, function(match, $1, $2, offset, orig)
	{
		var trailingBraces = $2;
		var content = $1 + trailingBraces.substring(2);
		return "{"+$1.replace(/\}/g, "[[[[[RIGHT_BRACE]]]]]")+"}";
	});
};

var EXP_TAG_REGEX = /\{(\/)?(\w+)(\s+.*?)?(\/)?\s*}/g;
var CONTROL_STRUCT_NAMES = /^(if|for|while|else|with)$/;
var processStructures = function(ejs)
{
	ejs = replaceDoubleBraces(ejs);

	// collapse space between {/if} and {else}
	ejs = ejs.replace(/\{\/if\}\s*?\{else\}/g, "{/if}{else}");

	var nameStack = [];

	return ejs.replace(EXP_TAG_REGEX, function(match, $1, $2, $3, $4, offset, orig)
	{
		var isClose = $1 == "/";
		var name = $2;
		var args = $3;
		var isEmpty = $4 == "/";

		if(isClose)
		{
			if(nameStack.length == 0 || nameStack.pop() != name)
				throw "Invalid syntax";

			if(name.match(CONTROL_STRUCT_NAMES))
				return "<%}%>";
			else
				return "<%});%>";
		}
		else if(isEmpty)
		{
			return "<%="+name+"("+args+")%>";
		}
		else // open non-empty
		{
			nameStack.push(name);

			if(name.match(CONTROL_STRUCT_NAMES))
			{
				if(args)
					args = "("+args+")";
				else
					args = "";

				return "<%"+name+args+"{%>";
			}
			else
			{
				if(args)
					args = args + ",";
				else
					args = "";

				return "<%="+name+"("+args+"function(){%>";
			}
		}
	}).replace(/\[\[\[\[\[RIGHT_BRACE\]\]\]\]\]/g, "}");
};
