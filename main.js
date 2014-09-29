Parse.Cloud.job("calculateDistances", function(request, status){
  var DistanceObject = Parse.Object.extend('Distance');
  var View = Parse.Object.extend("View");

  // Query for all distanceObjects
  var query = new Parse.Query(DistanceObject);
  query.each(function(dObj){

    var u1 = dObj.get('u1');
    var u2 = dObj.get('u2');

    var u1relation = u1.relation("viewedMoments").query();

    var u2relation = u2.relation("viewedMoments").query();

    //Query for their views that have moments seen by User1 AND User2.
    var u1CommonViews = new Parse.Query(View);
    u1CommonViews.equalTo("whoViewed",u1).matchesQuery("viewedWhat",u1relation).matchesQuery("viewedWhat",u2relation).ascending('viewedWhat');

    var u2CommonViews = new Parse.Query(View);
    u2CommonViews.equalTo("whoViewed",u2).matchesQuery("viewedWhat",u1relation).matchesQuery("viewedWhat",u2relation).ascending('viewedWhat');

    return u1CommonViews.find(function(u1Results){
      console.log('u1 common views found: '+u1Results);
      u2CommonViews.find(function(u2Results){
        console.log('u2 common views found: '+ u2Results);
        //do some math. but for now, I'd like to just confirm that it's getting these objects.
        var d = doMath(u1Results,u2Results);

        dObj.set('distance',d);
        
        // Return a promise that will be resolved when the delete is finished.
        return dObj.save();
      });
    });
  }).then(function(success) {
    // Set the job's success status
    status.success("Job completed successfully.");
  }, function(error) {
    // Set the job's error status
    status.error(error.message);
  });

  function doMath(u1moments,u2moments){
    var unsquarerootedSum=0;
    for (var i=0; i<u1moments.length;i++){
      unsquarerootedSum = unsquarerootedSum + Math.pow((u1moments[i].get('timeViewed')+u2moments[i].get('timeViewed')),2);
    }
    return Math.sqrt(unsquarerootedSum);
  }

});