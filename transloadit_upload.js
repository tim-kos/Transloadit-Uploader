(function($) {
  function TransloaditUploader() {
  }

  TransloaditUploader.prototype.init = function($container, properties) {
    this.$container     = $container;
    this.$form          = $container.find('form');
    this.$progressbar   = $container.find('.js_progress').initProgress();
    this.$cancel        = $container.find('.js_cancel');
    this.$files         = null;

    this.uploadBound    = false;
    this.errorTimeout   = properties.errorTimeout || 15000;
    this.gotStartEvent  = false;
    this.uploadFinished = false;

    this.crossImg       = properties.crossImg   || '/css/img/cross.png';
    this.inputLabel     = properties.inputLabel || '5GB Max';
    this.errorUrl       = properties.errorUrl   || false;
    this.cancelMsg      = properties.cancelMsg  || 'The upload was cancelled. The page is reloaded so you can try a new upload.';

    this._dynamicFileInputAdding();
    this._reloadFiles();
    this._prettifyUploadInputs();

    this.bindValidate();
  };

  TransloaditUploader.prototype._dynamicFileInputAdding = function() {
    var self = this;
    this.$container.find('input[type=file]').live('change', function() {
      self.changeFile(this);
    });
  };

  TransloaditUploader.prototype.changeFile = function(obj) {
    var file = $(obj).val();
    if (file == '') return;

    var $parent = $(obj).parents('.choose-file');

    var $clone = $parent.clone(true);
    $clone.insertAfter($parent);

    if (file) {
      file = file.substr(file.lastIndexOf("\\")+1);
      var $label = $(obj).parents('.filebutton').addClass('active');
      $label.find('span.txt').text(file);
    }

    this._reloadFiles();
  };

  TransloaditUploader.prototype._reloadFiles = function() {
    this.$files = this.$form.find('input[type=file]');
    var howMany = this.$files.length;

    if (howMany == 1) {
      this.$container.find('.file .delete').hide();
    } else {
      this.$container.find('.file').each(function(i) {
        if (i < howMany - 1) {
          $(this).find('.delete').show();
        }
      })
    }
  };

  TransloaditUploader.prototype._removeLastFileInput = function() {
    var howMany = this.$files.length;
    if (howMany > 1) {
      this.$container.find('.choose-file:eq(' + (howMany - 1) + ')').remove();
    }
    this._reloadFiles();
  };

  TransloaditUploader.prototype._prettifyUploadInputs = function() {
    var self = this;

    var howMany = this.$files.length;

    this.$files.each(function() {
      var self = this;

      $(this).wrap($('<span/>'));
      var $span = $(this).parent();
      $span.wrap('<label class="filebutton"></label>');
      var $label = $(this).parents('.filebutton');
      $label.prepend('<span class="txt">' + self.inputLabel + '</span>');

      var $del = $('<a class="js_delete delete" href="#"><img src="' + self.crossImg + '" /></a>');
      $del.insertAfter($label);

      if (howMany == 1) {
        $del.hide();
      }
    });

    this.$container.find('.choose-file .js_delete').live('click', function() {
      if (self.$container.find('.choose-file').length == 1) {
        $(this)
          .siblings('.filebutton').removeClass('active')
          .find('span.txt').text(self.inputLabel).end()
          .find('input').val('');
      } else {
        $(this).parents('.choose-file').remove();
      }
      self._reloadFiles();
      return false;
    });
  };

  TransloaditUploader.prototype.bindValidate = function() {
    var self = this;

    var validator = this.$form.validate({
      rules: {
        // add more validation rules here
        'data[Upload][files]': {
          required: true,
          minlength: 2
        },
        'data[Upload][files][0]': {
          required: true,
          minlength: 2
        }
      },
      messages: {
        'data[Upload][files]': 'Please choose a file.',
      },
      errorPlacement: function(error, element) {
        element.parent().addClass('error');
      },
      success: function(label) {
        var name = $(label).attr('for');
        $('#' + name).parent().removeClass('error');
      },
      submitHandler: function(form) {
        if (!self.uploadFinished) {
          self.triggerUpload();
        } else {
          form.submit();
        }
      },
    });

    self.$files.change(function() {
      if ($(this).val() != '') {
        $(this).parent().removeClass('error');
      }
    });
  };

  TransloaditUploader.prototype.triggerUpload = function() {
    var self = this;

    this._removeLastFileInput();
    this.bindUpload();

    this.$form.hide();
    this.$form.trigger('submit.transloadit');

    this.$progressbar.show().updateProgress(0, 1000);

    setTimeout(function() {
      if (!self.gotStartEvent) {
        self.uploadError();
      }
    }, self.errorTimeout);
  };

  TransloaditUploader.prototype.uploadError = function() {
    this.$form.transloadit('stop');
    this.$progressbar.hide();
    this.$cancel.hide();

    if (this.errorUrl) {
      window.location.href = this.errorUrl;
    }
  };

  TransloaditUploader.prototype.bindUpload = function() {
    this.uploadBound = true;
    var assemblyId   = null;
    var self         = this;

    this.$form.transloadit({
      wait: true,
      autoSubmit: true,
      modal: false,
      onStart: function(obj) {
        self.gotStartEvent = true;
        assemblyId = obj.assembly_id;
      },
      onProgress: function(bytesReceived, bytesTotal, assembly) {
        if (assembly.ok != 'ASSEMBLY_UPLOADING') {
          self.$progressbar.finishProgress(true);
          self.$cancel.hide();
          return;
        }
        self.$progressbar.updateProgress(bytesReceived, bytesTotal);
      },
      onError: function(obj) {
        self.uploadError();
      },
      onSuccess: function() {
        self.uploadFinished = true;
        self.$form.transloadit('stop');
        self.$form.unbind('submit.transloadit');

        if ($('#UploadAssemblyId').length === 0) {
          $('<input value="' + assemblyId + '">')
            .attr('id', 'UploadAssemblyId')
            .attr('name', 'data[Upload][assembly_id]')
            .hide()
            .prependTo(self.$form);
        }
      },
      onCancel: function() {
        self.$progressbar.hide();
        alert(self.cancelMsg);
        window.location.href = window.location.href;
      }
    });
  };

  $.fn.transloaditUpload = function(properties) {
    this.each(function() {
      var uploader = new TransloaditUploader();
      uploader.init($(this), properties);
    });

    return this;
  };
})(jQuery);