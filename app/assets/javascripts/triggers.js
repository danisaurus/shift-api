$(document).ready(function(){
  var days = $("#trigger_duration_in_hours");
  var editUrl = "";
  var edittedRow = "";
  days.val(1);
  days.hide();
  $('#triggerSentimentNotification').hide();
  $('.messageHolder').hide();
  $("body").on( "click", "#toggle-up", function(event) {
    console.log('shit')
    days.val(Number(days.val()) + 1);
      $('#incDays').text(days.val());
    if (days.val() > 1) {
      $('#day').text('days')
    }

  });

  $("body").on( "click", "#toggle-down", function(event) {
    console.log('shit')
    if (days.val() > 1){
      days.val(days.val() - 1);
      $('#incDays').text(days.val());
      $('#day').text('day')
    }
    if (days.val() > 1) {
      $('#day').text('days')
    }

  });

  $('#new_trigger').on("submit", function(event){
    event.preventDefault();
    var url = $(this).attr( 'action' ),
        data = $("#new_trigger").serialize(),
        par = $('body');

    $.post(url, data, function(serverResponse, status, jqXHR) {
      if ( serverResponse.match(/class='disappear'/) ) {
        $(serverResponse).hide().appendTo('#errorMessageArea').fadeIn();
        $('.disappear').delay( 2000 ).fadeOut();
      } else {
      $(serverResponse).hide().appendTo('.tbody').fadeIn();
      $('form').find("textarea").val("");
      }
    });
  });

  $('body').on('click', '.toggle-up', function(event){
    event.preventDefault();
    var url = $(event.target).parent().attr('href');
    var par = $(event.target).parent().parent().next();
    var dayVal = par.children().first();
    var oldVal = parseInt(dayVal.text());
    var newVal = oldVal + 1;
        dayVal.text(newVal)
    $.get(url, function(serverResponse, status, jqXHR){
    });
  });

  $('body').on('click', '.toggle-down', function(event){
    event.preventDefault();
    var url = $(event.target).parent().attr('href');
    var par = $(event.target).parent().parent().prev();
    var dayVal = par.children().first();
    var oldVal = parseInt(dayVal.text());
    if (oldVal > 1 ){
        var newVal = oldVal - 1;
            dayVal.text(newVal)
          }
    $.get(url, function(serverResponse, status, jqXHR){
    })
  })

  $('body').on('click', '.editTrigger', function(event){
    event.preventDefault();
    var url = $(this).parent().attr('href');
    var appendArea = $('#editTriggerSettings');
        editUrl = $(this).attr('href');
        edittedRow = $(this).parent().parent();
    $.get(editUrl, function(serverResponse, status, jqXHR){
      $('#showNewTrigger').hide();
      $('#newTriggerSettings').hide();
      appendArea.append(serverResponse);
    });
    });

  $('body').on('submit', '.edit_trigger', function(event){
    event.preventDefault();
    var url    = editUrl.replace('/edit',''),
        id     = url.split('/').reverse()[0],
        formId = '#edit_trigger_' + id,
        data   = $(formId).serialize();
        edittedRow.hide();
    $.post(url, data, function(serverResponse, status, jqXHR){
      $(serverResponse).hide().appendTo('.tbody').fadeIn();
      $('#showNewTrigger').show();
      $('#newTriggerSettings').show();
      $('#editTriggerSettings').hide();
    })
  });


    var changeDivColorTheSequel = function(div, color, margin){
        div.animate({
              backgroundColor: color,
              'margin-left': margin
            }, 400 );
      }

    $('body').on('click', '.trigDelete', function(event){
      event.preventDefault();
      var url = $(this).attr('href');
      var par = $(this).parent().parent();
      par.fadeOut('slow');
      $.get(url, function(serverResponse, status, jqXHR){})
    });

  $('body').on('click', '.toggleTwitterTriggers', function(event){
    event.preventDefault();
    var url = $(this).attr('href');
    var childTarget = $(this).children().first().children().first()
    if ( childTarget.css("margin-left") === '1px' ) {
      changeDivColorTheSequel(childTarget, 'rgb(131, 38, 38)', 19)
    } else {
     changeDivColorTheSequel(childTarget, 'rgb(222, 249, 222)', 1)
    }
    $.get(url, function(serverResponse, status, jqXHR){
    });
  });

   $('body').on('change', '#triggerMenu', function(event) {
    if ( $(this).val() === "check_email_sentiment" ) {
      $('#triggerSentimentNotification').slideDown();
    } else if ( $(this).val() === "check_twitter_sentiment" ) {
      $('#triggerSentimentNotification').slideDown();
    } else {
      $('#triggerSentimentNotification').slideUp();
    }

   });

});


