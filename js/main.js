(function(jQuery) {
    function toggleClassOnHeight (element, className, height) {
        var scrolltop = $(window).scrollTop(),
            elementHasClass = element.hasClass(className);
        if ( (scrolltop > height) && !elementHasClass ){
            element.addClass(className);
        }
        else if((scrolltop <= height) && elementHasClass) {
            element.removeClass(className);
        }
    };

    /**
     * on a set of links, a specified 'highlight' class is added to the link which matches
     * the current link href - the same class is removed from the other links
     * @param linkElements: jQuery selector of all link elements
     * @param currentLinkHref:
     * @param classname
     */
    // function setupLinkActiveClassToggler (linkElements, highlightClass) {

    //     function _toggle (linkElements, activeLinkHref, highlightClass) {
    //         linkElements.each(function() {
    //             var link = $(this);
    //             if(link.attr('href') === activeLinkHref) {
    //                 link.addClass(highlightClass);
    //             }
    //             else {
    //                 link.removeClass(highlightClass);
    //             }
    //         });

    //     }

    //     linkElements.click(function (event) {

    //         _toggle(linkElements, event.target.getAttribute('href'), highlightClass);

    //     });





    // }

    function applyActiveClassBySectionId (elements, activeSectionId, activeClassName) {
        elements.each(function() {
            var elem = $(this);
            if(elem.data('section-id') === activeSectionId){
                elem.addClass(activeClassName);
            }
            else {
                elem.removeClass(activeClassName);
            }
        });
    }

    function getSectionInfo (sectionElements) {
        var firstElement = sectionElements.eq(0),
            lastElement = sectionElements.eq(sectionElements.length-1),

            returnObj = {
                top: firstElement.offset().top,
                bottom: lastElement.offset().top + lastElement.height(),
                bottomValues: {}
            };
        sectionElements.each(function(){
            var elem = jQuery(this),
                id = elem.data("section-id"),
                bottomPixels = elem.offset().top + elem.height();
            returnObj.bottomValues[bottomPixels] = id;
        });
        return returnObj;
    }

     //returns the section name if the top of the viewport (plus any topMargin) falls within the range of a section (is between its top and bottom values)
     function determineActiveSection(sectionInfo, currentHeight, topMargin) {
        var activeSection = "",
            height = currentHeight + topMargin,
            sectionBottomValues = _.map(_.keys(sectionInfo.bottomValues), function(key) {return parseInt(key, 10)}).sort(); //ascending integer values
        if (height < sectionInfo.top || height > sectionInfo.bottom) {
            return false;
        }
        for(var i = 0, len = sectionBottomValues.length; i < len; i++){
            var currentSectionBottomValue = sectionBottomValues[i];
            if(height < currentSectionBottomValue) {

                activeSection = sectionInfo.bottomValues[currentSectionBottomValue];
                break;
            }
        }
        return activeSection;
     };



    jQuery(document).ready(function($) {
        function toggleClassWrapper () {
             toggleClassOnHeight( $(".navbar-default"), "navbar-fixed-top", $('.intro-wrapper').height());
        }

        
        toggleClassWrapper(); //in case the page is refreshed on a section




       var animationTime = 600, // time in milliseconds
            contentTop = [],
            linkElements = $(".nav a"),
            navElement = $("nav"),
            sectionInfo = getSectionInfo($("div.section-wrapper")),    
            activeSection = false,
            navFixedImmediately = navElement.hasClass("navbar-fixed-top"),// the margins change slightly depending on whether the nav is fixed on page load (ie. after a page refresh )
            topMargin = navFixedImmediately ? (navElement.height() / 2) : navElement.height();



       // Set up content an array of locations
         linkElements.each(function(){
                        var top = $( $(this).attr('href') ).offset().top;
            // contentTop.push( navFixedImmediately ? top : topMargin );
          contentTop.push( navFixedImmediately ? top : (top - topMargin / 2) );
        });

         // Animate menu scroll to content
         linkElements.click(function(){
             var sel = this,
               newTop = Math.min( contentTop[ linkElements.index( $(this) ) ], $(document).height() - $(window).height() ); // get content top or top position if at the document bottom
               $('html,body').stop().animate({ 'scrollTop' : newTop }, animationTime, function(){
                //window.location.hash = $(sel).attr('href');
            });
               return false;
           });


        // Stop animated scroll if the user does something
        $('html,body').bind('scroll mousedown DOMMouseScroll mousewheel keyup', function(e){
          if ( e.which > 0 || e.type == 'mousedown' || e.type == 'mousewheel' ){
             $('html,body').stop();
         }
        });

        $(window).scroll(function(){
            toggleClassWrapper();

            recalculatedActiveSection = determineActiveSection(sectionInfo, $(document).scrollTop(), topMargin); //not caching height as it can change after a resize

            if(activeSection !== recalculatedActiveSection){    
                activeSection = recalculatedActiveSection;
                applyActiveClassBySectionId(linkElements, activeSection, 'active');

            }

        });



        /*MAP STUFF*/

        var map = new google.maps.Map(document.getElementById("map-canvas"),
                {
                    scrollwheel: false,
                    center: new google.maps.LatLng(54.897317,23.888133),
                    zoom: 14
                }
            ),

//            markers = [
//                {
//                    title: ""
//                }
//
//
//            ],






            markers = [
                new google.maps.Marker({
                    position: new google.maps.LatLng(54.896873,23.885948),
                    title:"Rotušė",
                    icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=1|E3545B|000000"
                }),
                new google.maps.Marker({
                    position: new google.maps.LatLng(54.89467,23.88507),
                    title:"Prieplauka",
                    icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=2|E3545B|000000"
                }),
                new google.maps.Marker({
                    position: new google.maps.LatLng(54.896392,23.892943),
                    title:"Senieji rūsiai",
                    icon:"http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=3|E3545B|000000"
                })
            ];
            _.each(markers, function(marker) {
                marker.setMap(map);
            });

    });




}(jQuery));

