var express = require("express"),
	app = express(),
	async = require("async"),
	request = require('request');

var FitbitApiClient = require("fitbit-node"),
	client = new FitbitApiClient("9b7a5613c40dbcc7ed6c39b3bd138396", "a24b14f5e5a75333174c758e22b8cc05");

var requestTokenSecrets = {};

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use("/public", express.static("public"));

// Login page for the app
app.get("/", function (req, res) {
	res.render('pages/index');
});

// Authorize user's fitbit data
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

// Next stage of app after successful authentication
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
			userId = results[2].encoded_user_id,
			mostRecentCalorieBurned,
			lowerLimit,
			upperLimit,
			healthyRecipeURL,
			fattyRecipeURL;

		async.series([
			// GET request for the user's profile data
		  function(callback){
		    client.get('/profile.json', accessToken, accessTokenSecret).then(function (profile_res){
		    	callback(null, profile_res)
		    });
		  },
		  	// GET request for the user's most recent tracker activity 
		  function(callback){
		    client.get('/activities/calories/date/today/1d.json', accessToken, accessTokenSecret).then(function (activity_res) {
		    	mostRecentCalorieBurned = parseInt(JSON.parse(activity_res[0])["activities-calories"][0]["value"])
		    	lowerLimit = mostRecentCalorieBurned - 25
		    	upperLimit = mostRecentCalorieBurned + 25
		    	healthyRecipeURL = "https://api.edamam.com/search?q=healthy&calories=gte" + lowerLimit.toString() + ",lte" + upperLimit + "&to=1&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"
		    	fattyRecipeURL = "https://api.edamam.com/search?q=fatty&calories=gte" + lowerLimit.toString() + ",lte" + upperLimit + "&to=1&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"
		    	
		    	callback(null, mostRecentCalorieBurned)
		    });
		  },
		  	// GET request for the associated recipes 
		  function(callback){
		    request(healthyRecipeURL, function (error, response, healthy_recipe_res) {
		      if (!error && response.statusCode == 200) {
		        callback(null, healthy_recipe_res)
		      }
		    })
		  },
		  function(callback){
		    request(fattyRecipeURL, function (error, response, fatty_recipe_res) {
		      if (!error && response.statusCode == 200) {
		        callback(null, fatty_recipe_res)
		      }
		    })
		  }],
		  function(err, response){
		    // Object for user properties from 1st call
		    var currentUser = JSON.parse(response[0][0]).user
		    // Object for unhealthy recipe properties from 3rd callback
		    var healthyRecipe = JSON.parse(response[2]).hits[0].recipe
		    // Object for fatty recipe properties from 4th callback
		    var fattyRecipe = JSON.parse(response[3]).hits[0].recipe

		    
		    res.render('pages/recipe', {
		    	profileImage: currentUser.avatar,
		    	profileName: currentUser.fullName,
		     	recentCalorie: mostRecentCalorieBurned,
		    	recipeHealthyImage: healthyRecipe.image,
		    	recipeHealthyName: healthyRecipe.label,
		    	recipeHealthyURL: healthyRecipe.shareAs,
		    	recipeFattyImage: fattyRecipe.image,
		    	recipeFattyName: fattyRecipe.label,
		    	recipeFattyURL: fattyRecipe.shareAs
		    })
		  }
		)
	}, function (error) {
		res.send(error);
	});
});



app.listen(3000);



// curl "https://api.edamam.com/search?q=fatty&calories=gte350,lte500&diet=high-protein&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"

// curl "https://api.edamam.com/search?q=healthy&calories=gte350,lte500&diet=low-fat&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"




// app.get("/greetings", function (req, res) {

// 	var token = req.query.oauth_token,
// 		secret = requestTokenSecrets[token],
// 		verifier = req.query.oauth_verifier;
// 		console.log("token", token)
// 		console.log("secret", secret)
// 		console.log("verifier", verifier)
// 	client.getAccessToken(token, secret, verifier).then(function (results) {
// 		var accessToken = results[0],
// 			accessTokenSecret = results[1],
// 			userId = results[2].encoded_user_id;
// 		client.get('/activities/calories/date/today/1d.json', accessToken, accessTokenSecret).then(function (results) {
// 			var mostRecentCalorieBurned = JSON.parse(results[0])["activities-calories"][0]["value"]
// 			var lowerLimit = mostRecentCalorieBurned - 25
// 			var upperLimit = mostRecentCalorieBurned + 25
// 			var recipeSearchURL = "https://api.edamam.com/search?q=chicken&calories=gte" + lowerLimit + ",lte" + upperLimit + "&to=2&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"
// 			var response = results[0];
// 			console.log(response)
// 		});

// 		client.get('/profile.json', accessToken, accessTokenSecret).then(function (results){
// 			res.render('pages/recipe', {
// 				response: response
// 			})
// 		})
// 	}, function (error) {
// 		res.send(error);
// 	});
// });

// curl "https://api.edamam.com/search?q=fatty&calories=gte1600,lte1700&to=1&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"


// curl "https://api.edamam.com/search?q=healthy&calories=gte1600,lte1700&to=1&app_id=6006c520&app_key=f42685cf230e5515b4a73f0dff57912a"