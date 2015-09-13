var express = require("express"),
	app = express();

var FitbitApiClient = require("fitbit-node"),
	client = new FitbitApiClient("9b7a5613c40dbcc7ed6c39b3bd138396", "a24b14f5e5a75333174c758e22b8cc05");

var requestTokenSecrets = {};

function dateFinder () {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();

			if(dd<10) {
			    dd = '0' + dd
			} 

			if(mm<10) {
			    mm = '0' + mm
			} 

			today = yyyy + '/' + mm +'/' + dd;
			return today
		}



app.get("/authorize", function (req, res) {
	client.getRequestToken().then(function (results) {
		var token = results[0],
			secret = results[1];
		requestTokenSecrets[token] = secret;
		res.redirect("http://www.fitbit.com/oauth/authorize?oauth_token=" + token);
	}, function (error) {
		res.send(error);
	});
});

app.get("/greetings", function (req, res) {

	var token = req.query.oauth_token,
		secret = requestTokenSecrets[token],
		verifier = req.query.oauth_verifier;
		console.log("token", token)
		console.log("secret", secret)
		console.log("verifier", verifier)
	client.getAccessToken(token, secret, verifier).then(function (results) {
		var accessToken = results[0],
			accessTokenSecret = results[1],
			userId = results[2].encoded_user_id;
		return client.get('/activities/calories/date/today/1d.json', accessToken, accessTokenSecret).then(function (results) {
			debugger;
			var mostRecentCalorieBurned = JSON.parse(results[0])["activities-calories"][0]["value"]
			var lowerLimit = mostRecentCalorieBurned - 25
			var upperLimit = mostRecentCalorieBurned + 25
			var recipeSearchURL = "https://api.edamam.com/search?q=chicken&calories=gte" + lowerLimit + ",lte" + upperLimit + "&to=2&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"
			var response = results[0];
			console.log(response)
			res.send(response);
		});
	}, function (error) {
		res.send(error);
	});
});

app.listen(3000);



// curl "https://api.edamam.com/search?q=fatty&calories=gte350,lte500&diet=high-protein&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"

// curl "https://api.edamam.com/search?q=healthy&calories=gte350,lte500&diet=low-fat&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"