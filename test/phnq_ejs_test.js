var phnq_ejs = require("../phnq_ejs");
var phnq_core = require("phnq_core");
var fs = require("fs");
var path = require("path");
var assert = require("assert");

var getTestData = function(name, fn)
{
	var data = fs.readFileSync(path.join(__dirname, name), "UTF-8");
	var comps = data.split(/=+\n/);
	return {
			it: comps[0],
			objs: eval("("+comps[1]+")"),
			ejsFn: eval(phnq_ejs.compile(comps[2])),
			expected: comps[3]
		};
};

describe("phnq_ejs", function()
{
	describe("compile and run", function()
	{
		var names = fs.readdirSync(__dirname);

		var testNext = function()
		{
			if(names.length == 0)
				return;

			name = names.splice(0, 1)[0];
			if(name.match(/\.txt$/))
			{
				var testData = getTestData(name);
				it(testData.it, function()
				{
					var result = phnq_core.trimLines(testData.ejsFn(testData.objs._locals, testData.objs._this), true);
					var expected = phnq_core.trimLines(testData.expected, true);
					assert.equal(expected, result);
				});
			}
			testNext();
		};

		testNext();		
	});
});

