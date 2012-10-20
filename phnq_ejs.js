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
				str = processFunctions(processControlStructures(processExpressions(str)));

			var buf = [];
			buf.push("(function(_locals, _this){");
			buf.push("_locals = _locals || {};");
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


var EXP_REGEX = /\$\{([^}]+)\}/g;
var EXP_STRUC_REGEX = /([^\$]?)\{(if|else|for|while)(\s+[^\}]*)?}/g;
var EXP_STRUC_CLOSE_REGEX = /\{\/(if|else|for|while)\}/g;
var EXP_FUNC_EMPTY_REGEX = /([^\$]?)\{([^\s\/]+)(\s+[^\}]*)?\/\s*}/g;
var EXP_FUNC_REGEX = /([^\$]?)\{(\w+)(\s+[^\}]*)?}/g;
var EXP_FUNC_CLOSE_REGEX = /\{\/(\w+)\}/g;

var processExpressions = function(ejs)
{
	var buf = [];

	var m;
	var idx = 0;
	while((m = EXP_REGEX.exec(ejs)))
	{
		buf.push(ejs.substring(idx, m.index));
		buf.push("<%=");
		buf.push(m[1]);
		buf.push("%>");
		idx = EXP_REGEX.lastIndex;
	}
	buf.push(ejs.substring(idx));

	return buf.join("");
};

var processControlStructures = function(ejs)
{
	var buf = [];

	var m;
	var idx = 0;
	while((m = EXP_STRUC_REGEX.exec(ejs)))
	{
		buf.push(ejs.substring(idx, m.index));

		if(m[1].trim())
			buf.push(m[1]);

		buf.push("<%"+m[2]);
		if(m[3])
		{
			buf.push("("+m[3].trim()+")");
		}
		buf.push("{%>");
		idx = EXP_STRUC_REGEX.lastIndex;
	}
	buf.push(ejs.substring(idx));

	return buf.join("").replace(EXP_STRUC_CLOSE_REGEX, "<%}%>");
};

var processFunctions = function(ejs)
{
	var buf = [];

	var m;
	var idx = 0;
	while((m = EXP_FUNC_EMPTY_REGEX.exec(ejs)))
	{
		buf.push(ejs.substring(idx, m.index));

		if(m[1])
			buf.push(m[1]);

		buf.push("<%="+m[2]);
		buf.push("("+(m[3]||"").trim()+");");
		buf.push("%>");
		idx = EXP_FUNC_EMPTY_REGEX.lastIndex;
	}
	buf.push(ejs.substring(idx));

	return processBodyFunctions(buf.join(""));
};

var processBodyFunctions = function(ejs)
{
	var buf = [];

	var m;
	var idx = 0;
	while((m = EXP_FUNC_REGEX.exec(ejs)))
	{
		buf.push(ejs.substring(idx, m.index));

		if(m[1])
			buf.push(m[1]);

		buf.push("<%="+m[2]+"(");
		if(m[3])
		{
			buf.push(m[3].trim()+", ");
		}
		buf.push("function(){ %>");
		idx = EXP_FUNC_REGEX.lastIndex;
	}
	buf.push(ejs.substring(idx));

	return buf.join("").replace(EXP_FUNC_CLOSE_REGEX, "<%});%>");
};
