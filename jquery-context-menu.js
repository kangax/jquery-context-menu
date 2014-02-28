(function($) {

  var trueFn = function(){ return true },
      IE = false /*$.browser.msie*/;

  var defaultOptions = {
    selector: '.contextmenu',
    className: 'protoMenu',
    pageOffset: 25,
    fade: false,
    zIndex: 100,
    beforeShow: trueFn,
    beforeHide: trueFn,
    beforeSelect: trueFn
  };

  function Menu(options) {
    this.options = _.extend(_.clone(defaultOptions), options || { });

    this.$shim = $('<iframe>').prop({
      src: 'javascript:false;',
      frameborder: 0
    })
    .css({
      position: 'absolute',
      filter: 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)',
      display: 'none'
    });

    this.options.fade = this.options.fade;

    this.$container = $('<div>')
      .addClass(this.options.className)
      .css({ zIndex: this.options.zIndex })
      .hide();

    this.$list = $('<ul>');

    _.each(this.options.menuItems, this.addItem, this);

    this.$container.append(this.$list)
      .on('contextmenu', function(){return false})
      .on('click', 'li a', _.bind(this.onClick, this));

    $('body').append(this.$container);

    IE && $('body').append(this.$shim);

    $(document).on('click', _.bind(function(e) {

      if (this.$container.is(':visible') && e.which !== 3) {
        this.hide();
        return false;
      }
    }, this));

    $(document).on(window.opera ? 'click' : 'contextmenu', _.bind(function(e) {

      if (!$(e.target).parents(this.options.selector)[0]) {
        return;
      }
      if (window.opera && !e.ctrlKey) {
        return;
      }
      this.show(e);
      return false;
    }, this));
  }

  _.extend(Menu.prototype, {
    addItem: function(item) {

      var $link = $('<a href="#"></a>')
        .prop({ title: 'title' in item ? item.title : item.name })
        .data('callback', item.callback)
        .html(item.name)
        .addClass(item.className || '')
        .addClass(item.disabled ? 'disabled' : 'enabled');

      var $listEl = $('<li>').addClass(item.separator ? 'separator' : '').append(item.separator ? '' : $link);

      this.$list.append($listEl);
    },
    removeItem: function(item) {
      return this.getItem(item).remove();
    },
    getItem: function(item) {
      return _.find(this.$list.children(), function(el) {
        return el.innerHTML.indexOf(item) !== -1;
      });
    },
    show: function(e) {

      e.preventDefault();
      if (!this.options.beforeShow.call(this, e)) {
        this.hide();
        return;
      }
      jQuery(document).trigger('menu:show', { instance: this });

      var x = e.pageX,
          y = e.pageY,
          vpDim = { width: $(window).width(), height: $(window).height() },
          vpOff = { left: $(window).scrollLeft(), top: $(window).scrollTop() },
          elDim = { width: this.$container.width(), height: this.$container.height() },
          elOff = {
            left: ((x + elDim.width + this.options.pageOffset) > vpDim.width
              ? (vpDim.width - elDim.width - this.options.pageOffset) : x) + 'px',
            top: ((y - vpOff.top + elDim.height) > vpDim.height && (y - vpOff.top) > elDim.height
              ? (y - elDim.height) : y) + 'px'
          };
      this.$container.css(elOff);

      if (IE) {
        this.$shim.css(_.extend(_.extend(elDim, elOff), {
          zIndex: this.options.zIndex - 1
        })).show();
      }
      this.options.fade
        ? this.$container.fadeIn(250)
        : this.$container.show();
      this.event = e;
    },
    hide: function(e) {
      this.options.beforeHide(e);
      if (IE) this.$shim.hide();
      this.$container.hide();
    },
    onClick: function(e) {
      var $target = $(e.currentTarget);
      e.preventDefault();
      if ($target.data('callback') && !$target.hasClass('disabled')) {
        this.options.beforeSelect(e);
        if (IE) this.$shim.hide();
        this.$container.hide();
        $target.data('callback').call($target, this.event);
      }
    }
  });

  jQuery.ContextMenu = Menu;

})(jQuery);
