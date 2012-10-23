phnq_ejs - EJS Templates $Id$
========================
The phnq_ejs module is simple templating utility that uses embedded JavaScript. It's inspired by several familiar embedded language templating systems such as ERB, JSP, ASP, etc. EJS uses the same notation as the aforementioned systems for embedding dynamic code into templates.  For example:

	<%= foo %>

This will cause the result of the statement "foo" to be rendered.  So, if the value of "foo" were "bar", then the following...

	<h1><%= foo %></h1>

...would evaluate to:

	<h1>bar</h1>

Blocks of JavaScript are embedded with the <% %> notation.  For example:

	<% for(var i=0; i<5; i++) { %>
		<div>Number <%= i %></div>
	<% } %>

The above code would render as follows:

	<div>Number 0</div>
	<div>Number 1</div>
	<div>Number 2</div>
	<div>Number 3</div>
	<div>Number 4</div>

Very basic. Very simple.


Basic Usage
-----------

Import the phnq_ejs module:

	var phnq_ejs = require("phnq_ejs");

Or on the client just include the file.

Compile your template as a string:

	var compiled = phnq_ejs.compile(someString);

The compiled result is a string that can be eval'd to a function. For example:

	var fn = eval(compiled);

The result of executing the function will be the template rendered into a string.

Example
-------

Suppose the variable "tmplt" held the following string:

	<ul>
		<% for(var i=0; i<3; i++) { %>
			<li><%= i %></li>
		<% } %>
	</ul>

Compile that template string as follows:

	var compiled = phnq_ejs.compile(tmplt);

Turn the compiled code into a function like this:

	var fn = eval(compiled);

Render the template by calling the function:

	var output = fn();

In this examle, "output" would be the following:

	<ul>
		<li>0</li>
		<li>1</li>
		<li>2</li>
	</ul>

Parameters
----------

Suppose you have the following template in the variable "tmplt":

	<div>
		Name: <%= user.name %><br/>
		Email: <%= user.email %><br/>
	</div>

Where does the "user" object come from? It is not declared anywhere in the template. The answer is that information can be passed into the function that is eval's from the compiled code. For example:

Compile and eval to a function:

	var compiled = phnq_ejs.compile(tmplt);
	var fn = eval(compiled);

The resulting function can optionally take a single argument, an object that represents all of the "local" variables that are referenced from the template.  For example:

	var user = { name: "Bubba Gump", email: "bubba@gump.com" };

	var output = fn({user: user});

The resulting output in this case would be:

	<div>
		Name: Bubba Gump<br/>
		Email: bubba@gump.com<br/>
	</div>

