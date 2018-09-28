

$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(
      '<div data-id="'+ data[i]._id + '" class="card card-article" style="width: 45rem;">' +
      '<div class="card-body">' +
        '<h5 class="card-title">' + data[i].title + '</h5>' +
        '<p class="card-text">' + data[i].summary + '</p>' +
        '<a href="https://www.drugs.com' + data[i].link +'" class="card-link">https://www.drugs.com' + data[i].link + '</a>' +
      '</div>' +
    '</div>' +
  '</div>');
  }
});




// Whenever someone clicks card-article
$(document).on("click", ".card-article", function() {
  
  // $("#modal-note").modal('show');
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      //  console.log("data from get/articles", data.note._id);
      

      $("#notes").append(
        '<div class="card border-primary" >' +
            '<div class="card-header">Comments:</div>' +
            '<div class="card-body text-primary">' +
              '<h5 class="card-title">'+ data.title + '</h5>' +
              '<label for="titleinput">Subject:</label>' +
              '<input id="titleinput" class="form-control form-control-sm" type="text" placeholder=""></input>' +
              '<div class="form-group">' +
                '<label for="bodyinput">Comment:</label>' +
                '<textarea class="form-control" id="bodyinput" rows="3"></textarea>' +
              '</div>' +
              '<a data-id="' + data._id + '" id="savenote" href="#" class="btn btn-primary">Save Note</a>' +
              '<a data-id="' + data._id + '" id="deletenote" href="#" class="btn btn-danger">Delete Note</a>' +
            '</div>' +
          '</div>');


      // If there's a note in the article
      if (data.note) {
      
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        // $("#bodyinput").text(data.note.body);
        $("#bodyinput").val(data.note.body);
      }
    });
});






// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log("data-id from save:" + thisId);
  
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
    
  })
  
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


// When you click the deletenote button
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the input
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea

     
     body: $("#bodyinput").val()
    
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the textarea for note entry
  $("#bodyinput").val("");
  $("#titleinput").val("");
});