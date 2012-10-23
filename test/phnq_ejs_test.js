var phnq_ejs = require("../phnq_ejs");
var phnq_core = require("phnq_core");
var fs = require("fs");
var path = require("path");
var assert = require("assert");

var getTestData = function(name, fn)
{
	var data = fs.readFileSync(path.join(__dirname, name), "UTF-8");
	var comps = data.split(/=+\n/);
	var testData =
	{
		it: comps[0],
		expected: comps[3],
		ejs: comps[2]
	};
	try
	{
		testData.objs = eval("("+comps[1]+")");
	}
	catch(ex)
	{
		testData.objs = null;
	}
	return testData;
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
					assert.notEqual(testData.objs, null, "Test objects are null");

					var ejsCode = null;
					var ejsFn = null;

					var ex = null;
					try
					{
						ejsCode = phnq_ejs.compile(testData.ejs);
					}
					catch(exx)
					{
						ex = exx;
					}
					assert.equal(ex, null, "Couldn't compile ejs: "+testData.ejs + "\n\n" + ex);

					ex = null;
					try
					{
						ejsFn = eval(ejsCode);
					}
					catch(exx)
					{
						ex = exx;
					}
					assert.equal(ex, null, "Couldn't eval ejsCode: "+ejsCode + "\n\n" + ex);

					var result = phnq_core.trimLines(ejsFn(testData.objs._locals, testData.objs._this), true);
					var expected = phnq_core.trimLines(testData.expected, true);
					assert.equal(expected, result);
				});
			}
			testNext();
		};
		testNext();		
	});
});

