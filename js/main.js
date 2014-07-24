(function (jQuery) {

    function applyActiveClassBySectionId(elements, activeSectionId, activeClassName) {
        elements.each(function () {
            var elem = $(this);
            if (elem.data('section-id') === activeSectionId) {
                elem.addClass(activeClassName);
            }
            else {
                elem.removeClass(activeClassName);
            }
        });
    }

    function getSectionInfo(sectionElements) {
        var firstElement = sectionElements.eq(0),
            lastElement = sectionElements.eq(sectionElements.length - 1),

            returnObj = {
                top: firstElement.offset().top,
                bottom: lastElement.offset().top + lastElement.height(),
                bottomValues: {}
            };
        sectionElements.each(function () {
            var elem = jQuery(this),
                id = elem.data("section-id"),
                bottomPixels = Math.floor(elem.offset().top + elem.height());
            returnObj.bottomValues[bottomPixels] = id;
        });
        return returnObj;
    }

    //returns the section name if the top of the viewport (plus any topMargin) falls within the range of a section (is between its top and bottom values)
    function determineActiveSection(sectionInfo, currentHeight, topMargin) {
        var activeSection = "",
            height = currentHeight + topMargin,
            sectionBottomValues = _.map(_.keys(sectionInfo.bottomValues),function (key) {
                return parseInt(key, 10)
            }).sort(); //ascending integer values
        if (height < sectionInfo.top || height > sectionInfo.bottom) {
            return false;
        }
        for (var i = 0, len = sectionBottomValues.length; i < len; i++) {
            var currentSectionBottomValue = sectionBottomValues[i];
            if (height < currentSectionBottomValue) {

                activeSection = sectionInfo.bottomValues[currentSectionBottomValue];
                break;
            }
        }
        return activeSection;
    };


    jQuery(document).ready(function ($) {


        /*PRIVILEGES*/

        var raktas = window.location.search.match(/raktas=(\w+)/),
            privilegedClass = 'privileged',
            privilegedAccess = raktas !== null && raktas.length === 2 && raktas[1] === 'rusiai';
        
        if(privilegedAccess){
            $('.' + privilegedClass).removeClass(privilegedClass);
        }



        /*SHOW PAGE*/

        $('body').show();


        var animationTime = 600, // time in milliseconds
            linkElements = $("#pirmyn, #atgal, .nav a"),
            navElement = $("nav"),
            sectionInfo = getSectionInfo($("div.section-wrapper")),
            activeSection = false,
            navFixedImmediately = navElement.hasClass("navbar-fixed-top"), // the margins change slightly depending on whether the nav is fixed on page load (ie. after a page refresh )
            topMargin = navFixedImmediately ? (navElement.height() / 2) : navElement.height();


        // Animate menu scroll to content
        linkElements.click(function () {
            var contentTop = $($(this).attr('href')).offset().top;
            newTop = Math.min(contentTop, $(document).height() - $(window).height()); // get content top or top position if at the document bottom
            $('html,body').stop().animate({ 'scrollTop': newTop }, animationTime, function () {

            });
            return false;
        });


        // Stop animated scroll if the user does something
        $('html,body').bind('scroll mousedown DOMMouseScroll mousewheel keyup', function (e) {
            if (e.which > 0 || e.type == 'mousedown' || e.type == 'mousewheel') {
                $('html,body').stop();
            }
        });
        $(".navigation-wrapper").height(topMargin / 2); //preventing jumpy behaviour, see http://stackoverflow.com/questions/12070970
        navElement.affix({
            offset: { top: navElement.offset().top }
        });

        $(window).scroll(function () {

            recalculatedActiveSection = determineActiveSection(sectionInfo, $(document).scrollTop(), topMargin); //not caching height as it can change after a resize

            if (activeSection !== recalculatedActiveSection) {
                activeSection = recalculatedActiveSection;
                applyActiveClassBySectionId(linkElements, activeSection, 'active');

            }

        });

        /*MAILTO LINK*/

        $(".email").click(function(e){
            window.location.href = "mailto:" + $(this).html().replace(' [eta] ', '@') + "?Subject=Klausimas dėl vestuvių";
            e.preventDefault();

        })


        /*MAP STUFF*/

        var map = new google.maps.Map(document.getElementById("map-canvas"),
                {
                    scrollwheel: false,
                    center: new google.maps.LatLng(54.895762,23.888698),
                    zoom: 15
                }
            ),
            markers = [
                {
                    title: "Rotušė",
                    latitude: 54.896873,
                    longtitude: 23.885948,
                    content: "<b>Rotušė</b>"
                },
                {
                    title: "Prieplauka",
                    latitude: 54.89467,
                    longtitude: 23.88507,
                    content: "<b>Prieplauka</b>"
                }
            ],
            activeClassName = "active",
            mapLinks = $("#mapLinks a"),
            infoWindow = new google.maps.InfoWindow({
                content: ""
            });
            if(privilegedAccess){
                markers.push({
                    title: "Senieji rūsiai",
                    latitude: 54.896392,
                    longtitude: 23.892943,
                    content: "<b>Senieji rūsiai</b>"
                });
            }
        infoWindow.addListener("closeclick", function () {
            mapLinks.removeClass(activeClassName)
        });
        _.each(markers, function (markerData, index) {
            var position = new google.maps.LatLng(markerData.latitude, markerData.longtitude),
                marker = new google.maps.Marker({
                    position: position,
                    title: markerData.title,
                    icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + (index + 1) + "|E3545B|000000"
                }),
                mapLink = mapLinks.eq(index),
                clickFunction = function () {
                    mapLinks.removeClass(activeClassName);
                    mapLink.addClass(activeClassName);
                    infoWindow.content = markerData.content;
                    infoWindow.open(map, marker);
                };
            marker.setMap(map);

            google.maps.event.addListener(marker, 'click', function () {
                clickFunction();
            });
            mapLink.click(function (event) {
                event.preventDefault();
                clickFunction();
            });
        });

    });


}(jQuery));

