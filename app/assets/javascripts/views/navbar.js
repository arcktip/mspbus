/*
|----------------------------------------------------------------------------------------------------
| Navbar View
|----------------------------------------------------------------------------------------------------
*/

var NavbarView = Backbone.View.extend({
  
  el: '.navbar',

  events:  {
    'click #btn-fav': "goto_favorites"
  },

  search_history: null,

  initialize: function(args) {
    _.bindAll(this);

    // Which page did this component get initialized from?
    this.page = args.page;

    // Cache elements
    this.q = this.$el.find('#q');

    // Setup search history options based on a cookie.
    this.search_template = JST['templates/search_history'];
    this.find_search_history();

    // Setup event handlers that are outside of what backbone can do for handlers.
    this.$el.find('.btn-current-location').on('click', function(){window.location.href="/";});
    this.q.on("keypress", this.on_keypress);
    this.$el.find("#qsub").on('click', this.searchbox_action);
  },

  on_keypress: function(e) {
    if (e.which == 13) {
      this.searchbox_action();
    }
  },

  searchbox_action: function() {
    if (!this.q.is(":visible")){
      this.q.fadeIn('fast');
      return;
    }
   
    var val = this.q.val()
    
    // Push our new search item onto an array.
    this.push_search_item(val);

    // Check which callback we should run based on which page.
    if ( this.page === 'realtime' ) {
      address_search( val );
    } else if ( this.page === 'general_navbar' ) {
      window.location.href="/?q="+encodeURIComponent(val);
      return;
    }
  },

  push_search_item: function(value) {

    var duplicate = _.contains(this.search_history, value);

    if ( !duplicate ) {
      this.search_history.push(value);

      if ( this.search_history.length > 5 ) {
        this.search_history.splice(0,1);
      }

      this.$el.find("#search-history").append('<option value="' + value + '">');
      $.cookie('search_history', JSON.stringify(this.search_history) );
    }
  },

  find_search_history: function() {
    this.search_history = ($.cookie('search_history')) ? JSON.parse($.cookie('search_history')) : [];
    this.$el.find("#search-history").append( this.search_template({ items: this.search_history }) );
    this.q.relevantDropdown();
    // setTimeout( function() {
    //   self.q.relevantDropdown();
    // }, 1500);
  },

  goto_favorites: function() {
    window.location.href = "/fav";
  }
});
