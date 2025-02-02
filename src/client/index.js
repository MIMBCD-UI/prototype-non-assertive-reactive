//var path = require('path');

// Load in HTML templates
var viewportPath = "../public/templates/viewport.html";
var studyViewerPath = "../public/templates/studyViewer.html";

// The file with the list of all studies.
var fileName = '../common/studyList';
var fileFormat = '.json';
var studyListFile = fileName + fileFormat;


var pathToOutputs = "../common/outputs/";

var viewportTemplate; // the viewport template
loadTemplate(viewportPath, function(element) {
  viewportTemplate = element;
});

var studyViewerTemplate; // the study viewer template
loadTemplate(studyViewerPath, function(element) {
  studyViewerTemplate = element;
});

/* ================================================== */
/*
 * Definition of HTML Tag Variables
 */

var v001 = '<tr><td>';
var v002 = '</td><td>';
var v003 = '</tr>';
var v004 = '<li><div id=complete-tab><a href="#x';
var v005 = '" data-toggle="tab">';
var v006 = '</a>';
var v007 = '<input type="button" class="closeBtn" value="X" />';
var v008 = '</li></div>';
var v009 = " <br />";
var v010 = " <span style='color:red'>";
var v011 = " ";
var v012 = "% ";
var v013 = "!! <br />";
var v014 = ": ";
var v015 = "</span>";
var v016 = "Sorry i have no infomation about the patient! ";
var v017 = " <span />";

/* ================================================== */

var red = [255, 0, 0];

// Get study list from JSON manifest
$.getJSON(studyListFile, function(data) {
  // console.log("Getting study list...");
  if (typeof data.studyList === "object") {
    //console.log("Consuming study list...");
    data.studyList.forEach(function(study) {
      var c001 = study.patientId;   // Patient Id for current patient ---
      var c002 = study.studyDate;
      var c003 = study.modality;
      var c004 = study.studyDescription;
      var c005 = study.numImages;
      var c006 = study.studyId
      // Create one table row for each study in the manifest
      var p001 = v001 + c001 + v002;
      var p002 = c002 + v002 + c003;
      var p003 = v002 + c004 + v002;
      var p004 = c005 + v002 + v003;
      var studyRow = p001 + p002 + p003 + p004;
      // Append the row to the study list
      var studyRowElement = $(studyRow).appendTo('#studyListData');


      
      // On study list row click
      $(studyRowElement).click(function() {
        if ($('#tabs li').length >= 2) {
          alert('Please close the opened patient first !');
        } else {

          // Add new tab for this study and switch to it
          var studyTab = v004 + c001 + v005 + c001 + v006 + v007 + v008;

          $('#tabs').append(studyTab);
          // Add tab content by making a copy of the studyViewerTemplate element
          var studyViewerCopy = studyViewerTemplate.clone();

          var viewportCopy = viewportTemplate.clone();
          studyViewerCopy.find('.imageViewer').append(viewportCopy);

 
          studyViewerCopy.attr("id", 'x' + c001);
          // Make the viewer visible
          studyViewerCopy.removeClass('hidden');
          // Add section to the tab content
          studyViewerCopy.appendTo('#tabContent');

          // Show the new tab (which will be the last one since it was just added
          $('#tabs a:last').tab('show');

          // Toggle window resize (?)
          $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            $(window).trigger('resize');
          });

          studyViewerCopy.roiData = {
            studyId: c006,
            modality: c003,
            stacks: [],
          };

          $('.closeBtn').click(function() {
            console.log("clicked close btn");
            var element = this.parentNode.parentNode;
            $('#tabs a:first').tab('show');
            element.remove();
            var tabDataElement = element.firstChild.firstChild.getAttribute('href');
            if($(tabDataElement).length > 0){
              $(tabDataElement)[0].remove();
            }
            // Close Assistant block
            $('.assistant_block').css({display:'none'});
            $('.assistant_block_covariables').css({display:'none'});
            assistant_animation_out();
          });

          // Now load the study.json
          loadStudy(studyViewerCopy, viewportTemplate, c006 + fileFormat);

          // JSON File Path
          var jsonFileUrl = pathToOutputs + c001 + ".json";
          patientID = c001;

          var messageUrl = "../common/messages/assistant_msg.json";
          $.getJSON(jsonFileUrl)
            .done(function(individualPatientData) {
              // informations reading from json file
              let biradsAssis = individualPatientData.patient[0].biradsAssis;
              let biradsPhys = individualPatientData.patient[0].biradsPhys;
              let cancerChance = individualPatientData.patient[0].cancerChance;
              $.getJSON(messageUrl)
                .done(function(messageText) {
                  let msg1 = messageText.assisMessage[0].message_001;
                  let msg2 = messageText.assisMessage[0].message_002;
                  let msg3 = messageText.assisMessage[0].message_003;
                  
                  // Show the accept and reject buttons & the assistant block @Abdus Samad--
                  $(".accept-btn, .reject-btn").show();
                  $('.assistant_block').css({display:"block"}); 
                  var p005 = msg1;
                  var p006 = msg2;

                  let assistantText = p005 + textColored(cancerChance + v012,getBiradsAccuracyColor(parseInt(cancerChance)), 1, parseInt(cancerChance)) + 
                                      p006 + textColored(biradsAssis,getBiradsColor(parseInt(biradsAssis)), 2, parseInt(biradsAssis)) + msg3;

                  // display text if any data for the patient 
                  document.getElementById("assistant_information").innerHTML = assistantText;

                  assistant_animation_in();
                }) 
 
              })
              .fail(function(jqXHR, textStatus) {
                if (textStatus == 'parsererror') {
                  $.getJSON(messageUrl)
                  .done(function(messageText) {
                    let warn1 = messageText.assisWarning[0].warning_001;
                    let warn2 = messageText.assisWarning[0].warning_002;
                    let warn3 = messageText.assisWarning[0].warning_003;
                    $('.assistant_block').css({display:"block"});
                    let failAssistantText = v016 + warn1 + v017 + warn2 + warn3;
                    document.getElementById("assistant_information").innerHTML = failAssistantText;
                    
                    // Hide the Approve and Reject Btn
                    $(".accept-btn, .reject-btn").hide();
                    
                    // Transition of assistant block---
                    assistant_animation_in();
                  })
                }
            })
          
        }
      });
    });
  } else {
  }
});

// Resize main

// Show tabs on click
$('#tabs a').click (function(e) {
  e.preventDefault();
  $(this).tab('show');
});
// Resize main
function resizeMain() {
  var height = $(window).height();
  $('#main').height(height - 50);
  $('#tabContent').height(height - 50 - 42);
} 

// Call resize main on window resize
$(window).resize(function() {
  resizeMain();
});
resizeMain();

// Prevent scrolling on iOS
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
});

// Assistant Avatar Animation
function assistant_animation_in() {
  $(".assistant_block").delay(800).animate({
    right: '50%',
    opacity: '1'

  });
  $(".assistant_block_covariables").delay(800).animate({
    right: '50%',
    opacity: '1'

  });
}
// Assistant Avatar Animation
function assistant_animation_out() {
  $(".assistant_block").delay(1).animate({
    opacity: '0',
    right: '-150px'
  });
  $(".assistant_block_covariables").delay(1).animate({
    opacity: '0',
    right: '-150px'
  });
  
}
// Assistant switch -------


//Birads colors
function getBiradsAccuracyColor(value){
  let redValue = 50;
  let orangeValue = 80;
  let greenValue = 100;
  
  let redR = 207, redG = 42, redB = 39;
  let orangeR = 255, orangeG = 153, orangeB = 0;
  let greenR = 0, greenG = 158, greenB = 15;

  let redToOrangeScale = 30;
  let orangeToGreenScale = 20;
  
  if(value <= redValue)
      return [redR,redG,redB];

  else if(value > redValue && value < orangeValue)
      return [Math.round(redR + ((value - redValue)/redToOrangeScale) * (orangeR - redR)), 
              Math.round(redG + ((value - redValue)/redToOrangeScale) * (orangeG - redG)), 
              Math.round(redB + ((value - redValue)/redToOrangeScale) * (orangeB - redB))]

  else if(value == orangeValue)
      return [orangeR,orangeG,orangeB];

  else if(value > orangeValue && value < greenValue)
      return [Math.round(orangeR + ((value - orangeValue)/orangeToGreenScale)  * (greenR - orangeR)), 
              Math.round(orangeG + ((value - orangeValue)/orangeToGreenScale)  * (greenG - orangeG)), 
              Math.round(orangeB + ((value - orangeValue)/orangeToGreenScale) * (greenB - orangeB))]

  else
      return [greenR,greenG,greenB];
}

function getBiradsColor(value){
  let valTo100Scale = value *100/5;
  if(valTo100Scale >= 0 && valTo100Scale < 33)
    return [Math.round(0 + (valTo100Scale *100/33) *0.01 * (255 - 0)), Math.round(158 + (valTo100Scale *100/33)*0.01 * (255 - 158)), Math.round(15 + (valTo100Scale *100/33)*0.01 * (0 - 15))];
  else if(valTo100Scale >= 33 && valTo100Scale < 66)
    return [Math.round(255 + ((valTo100Scale - 33) *100/33) *0.01 * (255 - 255)), Math.round(255 + ((valTo100Scale - 33) *100/33)*0.01 * (153 - 255)), Math.round(0 + ((valTo100Scale - 33) *100/33)*0.01 * (0 - 0))];
  else
    return [Math.round(255 + ((valTo100Scale - 66) *100/34) *0.01 * (207 - 255)), Math.round(153 + ((valTo100Scale - 66) *100/34)*0.01 * (42 - 153)), Math.round(0 + ((valTo100Scale - 66) *100/34)*0.01 * (39 - 0))];
  

}