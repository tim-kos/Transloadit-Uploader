(function($) {
  var tlProgressTimeout = 3000;
  var steps = 30;
  var timeout = Math.floor(tlProgressTimeout / steps);

  $.fn.initProgress = function() {
    return this.each(function() {
      this.progbar = $('<div class="progbar"></div>').appendTo(this);
      this.percent = $('<div class="prog-percent"></div>').appendTo(this);
      this.remaining = $('<div class="prog-remain"></div>').appendTo(this);

      this.cycle = 0;
      this.bytesReceivedLastCycle = 0;
      this.progressTimeLastCycle = null;
      this.lastPercent = 0;
    });
  };

  $.fn.updateProgress = function(bytesReceived, bytesTotal) {
    var progressTime         = +new Date();
    var remainingMiliSeconds = 0;
    var uploadRate           = 0;

    var $this = this[0];

    if ($this.cycle > 0) {
      this.show();

      if (typeof $this.bytesReceivedLastCycle == 'undefined') {
        $this.bytesReceivedLastCycle = bytesReceived;
      }
      uploadRate = (bytesReceived - $this.bytesReceivedLastCycle) / (progressTime - $this.progressTimeLastCycle);
      if (uploadRate > 0) {
        remainingMiliSeconds = (bytesTotal - bytesReceived) / uploadRate;
      }

      // convert bytes/milliseconds into kb/s
      uploadRate = (uploadRate * 1000 / 1024).toFixed(1);

      var txt = uploadRate + 'kb/s, ' + Math.round(remainingMiliSeconds / 1000) + 's';
      $this.remaining.text(txt + ' remaining');

      $this.bytesReceivedLastCycle = bytesReceived;

      var percent = Math.floor(100 * bytesReceived / bytesTotal);
      var lastPercent = $this.lastPercent;
      var diff = percent - lastPercent;
      var percentPerStep = diff / steps;

      if ($this.progressTimout) {
        clearTimeout($this.progressTimout);
      }

      function advanceProgress() {
        $this.progressTimout = setTimeout(function() {
          var newPercent = lastPercent + percentPerStep;
          if (newPercent > percent) {
            newPercent = percent;
          }

          var toInsert = Math.floor(newPercent);
          if (isNaN(toInsert)) {
            toInsert = '0';
          }

          $this.percent.text(toInsert + '%');

          lastPercent = newPercent;
          if (newPercent != percent) {
            advanceProgress();
          }
        }, timeout);
      }
      advanceProgress();

      $this.lastPercent = percent;
    } else {
      $this.percent.text('0%');
      $this.remaining.text('...');
    }

    $this.progressTimeLastCycle = progressTime;
    if (bytesReceived == bytesTotal) {
      this.finishProgress(false);
    }

    $this.cycle++;
    return this;
  };

  $.fn.resetProgress =  function() {
    var $this = this[0];
    $this.cycle = 0,
    $this.bytesReceivedLastCycle = 0,
    $this.progressTimeLastCycle = null;

    $this.progbar.show().css({display:'inline-block'});
    $this.remaining.show().text('');

    return this;
  };

  $.fn.finishProgress =  function(hide) {
    hide = hide || false;
    var self = this;
    $this = this[0];

    if ($this.progressTimout) {
      clearTimeout($this.progressTimout);
    }
    $this.percent.text('100%');
    return this;
  };
})(jQuery);