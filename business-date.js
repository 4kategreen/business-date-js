(function($) {
  var settings = {
    today : false,
    startDate : false,
    endDate : false
  };


  var methods = {
    init : function(options) {
      return this.each(function() {
        var $this = $(this),
          data = $this.data('businessDate');


        if (!data) {
          settings.today = Date.today();
        }


        $(this).data('businessDate', {
          target : $this
        });
      });
    },
    // Adds a specificed number of days to a date, moving backward to a business day
    // if there's a weekend or holiday
    // formats can be added.
    businessDateAdd : function(number) {
      var date = Date.parseExact($(this).text(), 'MM/dd/yyyy');


      // daylight saving time fix
      if (date.getHours() != 0) {
        if (date.getHours() == 23) {
          date.addHours(1);
        } else if (date.getHours() == 1) {
          date.addHours(-1);
        }
      }


      var i=0;
      while (i<number) {
        date.add(1).day();
        if (methods.isBusinessDay(date)) {
          i++;
        }
      }


      return date;
    },


    // Returns the number of business days in a given date range.
    // Both the start date and end date are included.
    businessDateCompare : function(date_field) {
            var startDate = Date.parse($(this).text());
            var endDate = Date.parse(date_field);
      var days = 0;
      console.log(startDate);


      while(startDate.compareTo(endDate) < 0) {
        if(methods.isBusinessDay(startDate)) {
          days++;
        }
        startDate.add(1).day();
      }
      return days;
    },


    // Expects a string that's mm/dd/yyyy or a javascript date object.
    // Returns true or false
    isBusinessDay : function(date) {
      if(date.getDay() == 0 || date.getDay() == 6 || methods.isHoliday(date)) {
    return false;
      } else {
    return true;
      }
    },


    // This expects a data object or mm/dd/yyyy
    // Returns true if it's a day off for federal employees
    isHoliday : function(date) {
      // check simple dates (month/date - no leading zeroes)
      var n_date = date.getDate();
      var n_month = date.getMonth() + 1;
      var s_date1 = n_month + '/' + n_date;
      var n_wday = date.getDay();
      var n_wnum = Math.floor((n_date - 1) / 7) + 1;


      // New Year's Day can cause a cross year holiday observance
      if ((date.getMonth() == 11) && (date.getDate() == 31)) {
        if(date.getDay() == 5) {
          return true;
        }
      }


      // We only care about the day the holiday is observed.
      var holiDates = ['1/1', '7/4', '11/11', '12/25'];
      for(mmdd in holiDates) {
        // get a date to test
        var testDate = new Date (date);
        var holiParts = holiDates[mmdd].split('/');
        testDate.setMonth(holiParts[0] - 1);
        testDate.setDate(holiParts[1]);
        if(testDate.getDay() == 0) {
          // Sunday goes to Monday
          holiDates[mmdd] = holiParts[0]+"/"+(parseInt(holiParts[1])+1);
        } else if(testDate.getDay() == 6) {
          // Satuday goes to Friday
          holiDates[mmdd] = holiParts[0]+"/"+(parseInt(holiParts[1])-1);
        }


        // check against our date
        if(s_date1 == holiDates[mmdd]) {
          return true;
        }
      }


      // weekday from beginning of the month (month/num/day)
      var s_date2 = n_month + '/' + n_wnum + '/' + n_wday;


      if (   s_date2 == '1/3/1'  // Birthday of Martin Luther King, third Monday in January
       || s_date2 == '2/3/1'  // Washington's Birthday, third Monday in February
       || s_date2 == '9/1/1'  // Labor Day, first Monday in September
       || s_date2 == '10/2/1' // Columbus Day, second Monday in October
       || s_date2 == '11/4/4' // Thanksgiving Day, fourth Thursday in November
       ) return true;


      // weekday number from end of the month (month/num/day)
      var dt_temp = new Date (date);
      dt_temp.setDate(1);
      dt_temp.setMonth(dt_temp.getMonth() + 1);
      dt_temp.setDate(dt_temp.getDate() - 1);
      n_wnum = Math.floor((dt_temp.getDate() - n_date - 1) / 7) + 1;
      var s_date3 = n_month + '/' + n_wnum + '/' + n_wday;


      // Memorial Day, last Monday in May
      // if 5/31 is a Monday, the week is 0, otherwise its 1
      var temp_for_mem = new Date('5/31/'+date.getFullYear());
      if((temp_for_mem.getDay() == 1 && s_date3 == '5/0/1') || (temp_for_mem.getDay() != 1 && s_date3 == '5/1/1')){
        return true;
      }


      // misc complex dates
      if (s_date1 == '1/20' && (((date.getFullYear() - 1937) % 4) == 0)
      // Inauguration Day, January 20th every four years, starting in 1937.
      ) return true;


      return false;
    },


    // serves a specific function in visitor page.
    getDays : function(startDate,endDate) {
      return methods.countBusinessDays(startDate,endDate);
    }
  };


  $.fn.businessDate = function(method) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.businessDate' );
    }
  };
})(jQuery);