# What is this?

This is a javascript implementation of a custom Uploader for Transloadit (http://transloadit.com).
This serves as a showcase about how to render your own progress bar and how to integrate Transloadit with jQuery.validate (http://bassistance.de/jquery-plugins/jquery-plugin-validation/).

# How to install

On your webpage make sure to:

* load jQuery (http://jQuery.com)
* load jQuery validate (http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
* load the Transloadit jQuery plugin - http://assets.transloadit.com/js/jquery.transloadit2.js
* load the transloadit_progress.js file from this project
* load the transloadit_upload.js file from this project

After that create the following html code on your webpage:

<div class="js_upload">
  <form action="/">
  <!-- your form code here -->
  </form>
  <div class="progress js_progress"></div>
  <div class="js_error_url">http://url-to-redirect-to-if-there-is-an-upload-error</div>
</div>

And finally call the transloaditUpload() function on your upload div:

$('.js_upload').transloaditUpload();


#Customizations

Validation rules for the jQuery validate plugin need to be directly made in the code of your fork of the plugin.