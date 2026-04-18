class JBDConstants{};

JBDConstants.ITEM_TYPE_BUSINESS = 1;
JBDConstants.ITEM_TYPE_OFFER = 2;
JBDConstants.ITEM_TYPE_EVENT = 3;

JBDConstants.MAP_TYPE_GOOGLE = 1;
JBDConstants.MAP_TYPE_BING = 2;
JBDConstants.MAP_TYPE_OSM = 3;

JBDConstants.IS_ADMIN = 0;
JBDConstants.IS_FRONT = 1;

JBDConstants.QUOTE_MESSAGES_POLLING_INTERVAL = 5000; //milliseconds

;class JBDUtils{
    /**
     * Sets the main Utils properties. Should be set before trying to call other utility functions.
     *
     * @param properties array
     */
    setProperties(properties) {
        let tmp = '';

        if (properties["isProfile"] == JBDConstants.IS_ADMIN) {
            tmp = 'administrator/';
        }
        properties.url = properties.siteRoot + tmp + 'index.php?option=com_jbusinessdirectory';

        this.properties = properties;
    }

    /**
     * Get's a property value by its name.
     *
     * @param property string name of the property
     * @returns {*}
     */
    getProperty(property) {
    	if (typeof this.properties === 'undefined') {
            console.warn('JBDUtils properties not set!');
        } else {
            if (typeof this.properties[property] === 'undefined') {
                console.warn('JBDUtils property: ' + property + ' not found!');
            } else {
                return this.properties[property];
            }
        }

        return null;
    }
    
    /**
     * Get's a property value by its name.
     *
     * @param property string name of the property
     * @param value
     * @returns {*}
     */
    setProperty(property, value) {
       
        this.properties[property] = value;
          
        return true;
    }

    /**
     * Generates URL for Ajax Calls. If frontController is specified, it will be used instead of controller
     * when the call is initiated from site (not admin).
     *
     * @param task string name of the task
     * @param controller string name of the controller
     * @param frontController string optional, name of the front controller
     * @returns {string}
     */
    getAjaxUrl(task, controller, frontController = '') {
        let url = '';

        if (typeof controller === 'undefined' || controller.length === 0) {
            console.warn('Controller cannot be empty!');
            return url;
        }

        if (typeof task === 'undefined' || task.length === 0) {
            console.warn('Task cannot be empty!');
            return url;
        }

        let cntrl = controller;

        let isProfile = jbdUtils.getProperty('isProfile');
        if (isProfile === JBDConstants.IS_FRONT && frontController.length > 0) {
            cntrl = frontController;
        }

        let baseUrl = jbdUtils.getProperty('url');
        url += baseUrl + '&task=' + cntrl + '.' + task;

        return url;
    }

    /**
     * Convert given date to the date format set on general settings
     *
     * @param date string date
     * @returns {string}
     */
    getDateWithFormat(date) {
        let format = this.getProperty('dateFormat');
        let delimiter = '-';

        if (format.indexOf('/') > -1) {
            delimiter = '/';
        } else if (format.indexOf('\\') > -1) {
            delimiter = '\\';
        }

        let tmp = format.split(delimiter);

        let newDate = '';
        for (let i = 0; i < 3; i++) {
            if (tmp[i] === 'd')
                newDate += ("0" + date.getDate()).slice(-2);
            else if (tmp[i] === 'm')
                newDate += ("0" + (date.getMonth() + 1)).slice(-2);
            else if (tmp[i] === 'y' || tmp[i] === 'Y')
                newDate += date.getFullYear();

            if (i < 2)
                newDate += delimiter;
        }

        return newDate;
    }

    /**
     * Sleep function. Stop any process for an amount of milliseconds
     *
     * @param milliseconds int the amount of milliseconds to pause the process
     */
    sleep(milliseconds) {
        let start = new Date().getTime();
        for (let i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    /**
     * Increase the statistic for the item. All the info is passed through the parameters
     *
     * @param itemId int item id for the item that we will save the statistics
     * @param type int type of statistic
     * @param articleId int if there is a statistic for an article of any listing then we will need to store also the id
     * of the article
     */
    registerAction(itemId, type, articleId) {
        let urlWebsiteCount = jbdUtils.getAjaxUrl('increaseStatisticCountAjax', 'companies');

        jQuery.ajax({
            type: "GET",
            data: {
                companyId: itemId,
                type: type,
                articleId: articleId
            },
            url: urlWebsiteCount,
            success: function () {
            }
        });
    }

    /**
     * Increase the share clicks statistics for an item(listing, offer, event)
     *
     * @param itemId int item Id for the object who is being shared
     * @param itemType int the type of the object
     */
    increaseShareClicks(itemId, itemType) {
        let urlShareCount = jbdUtils.getAjaxUrl('increaseShareCountAjax', 'companies');

        jQuery.ajax({
            type: "GET",
            data: {
                itemId: itemId,
                itemType: itemType
            },
            url: urlShareCount,
            success: function () {
            }
        });
    }

    /**
     * Update the current url with the coordinates passed through parameters
     *
     * @param position object contain the latitude and logitude to pass to the url
     */
    addCoordinatesToUrl(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;

        let newURLString = window.location.href;
        newURLString += ((newURLString.indexOf('?') == -1) ? '?' : '&');
        newURLString += "geo-latitude=" + latitude;
        newURLString += ((newURLString.indexOf('?') == -1) ? '?' : '&');
        newURLString += "geo-longitude=" + longitude;

        window.location.href = newURLString;    // The page will redirect instantly
    }

    /**
     * Retrieve the cookie searched for by the parameters
     *
     * @param c_name string cookie we are searching for
     * @returns {string}
     */
    getCookie(c_name) {
        let i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
    }

    /**
     * Set the cookie based on the parameters sent to it
     *
     * @param c_name string the name of the cookie
     * @param value int the value of the cookie
     * @param exdays int the expiration days for that cookie
     */
    setCookie(c_name, value, exdays) {
        let exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        let c_value = escape(value)
            + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    /**
     * Whenever this function is called it will render the Radio buttons on that page.
     */
    renderRadioButtons() {
        //Turn radios into btn-group
        jQuery('.radio.btn-group label').addClass('btn');
        jQuery('.btn-group label:not(.active)').click(function () {
            let label = jQuery(this);
            let input = jQuery('#' + label.attr('for'));

            if (!input.prop('checked')) {
                label.closest('.btn-group').find('label').removeClass('active btn-success btn-danger btn-primary');
                if (input.val() == '') {
                    label.addClass('active btn-primary');
                } else if (input.val() == 0) {
                    label.addClass('active btn-danger');
                } else {
                    label.addClass('active btn-success');
                }
                input.prop('checked', true);
            }
        });

        jQuery('.btn-group input[checked=checked]').each(function () {
            if (jQuery(this).val() == '') {
                jQuery('label[for=' + jQuery(this).attr('id') + ']').addClass('active btn-primary');
            } else if (jQuery(this).val() == 0) {
                jQuery('label[for=' + jQuery(this).attr('id') + ']').addClass('active btn-danger');
            } else {
                jQuery('label[for=' + jQuery(this).attr('id') + ']').addClass('active btn-success');
            }
        });
    }

    //************--Edit Views--*****************//

    /**
     * Initialize the Autocomplete. All the component that will need to be filled will be passed through the params.
     *
     * @param preventSubmit boolean true or false if true the form will be submitted
     * @param componentForm array components that will be filled when the address is filled
     */
    initializeAdminAutocomplete(preventSubmit, componentForm) {
        let element = document.getElementById('autocomplete');

        JBDMapHelper.initAutocomplete(element, function (place) {
            jbdUtils.fillInAddress(place, componentForm);
        }, preventSubmit, true, null, componentForm);
    }

    /**
     * When a map is clicked an event is initialized and the marker will be set on map and also the coordinates will
     * be updated
     */
    addAdminMapClickAction() {
        if (typeof jbdAdminMapInstance !== 'undefined') {
            jbdAdminMapInstance.addMapListener('click', function (location) {
                jbdAdminMapInstance.clearMarkers();
                jbdAdminMapInstance.addMarker(location, function () {
                    document.getElementById("latitude").value = location.latitude;
                    document.getElementById("longitude").value = location.longitude;
                });
            });
        }
    }

    /**
     * Fill all the elements of the address form based on the information passed from autocomplete
     *
     * @param place array the details of the place that was selected from autocomplete and will be used to update the
     * elements in the address form
     * @param component_form array elements from form
     */
    fillInAddress(place, component_form) {
        for (let component in component_form) {
            let obj = document.getElementById(component);
            if (typeof maybeObject != "undefined") {
                document.getElementById(component).value = "";
                document.getElementById(component).disabled = false;
            }
        }
        for (let j in place) {
            let att = j;
            if (component_form[att]) {
                let val = place[j];
                jQuery("#" + att).val(val);
                if (att == 'country') {
                    jQuery('#country option').filter(function () {
                        return jQuery(this).text() === val;
                    }).attr('selected', true);
                    if (jbdUtils.getProperty('limit_cities_regions')) {
                        //TODO global reference (defined in edit views)
                        updateRegions();
                        updateCities();
                    }
                }

                if (jbdUtils.getProperty('limit_cities_regions')) {
                    //TODO global reference (defined in edit views)
                    updateRegions(function () {
                        if (att == 'administrative_area_level_1') {
                            jQuery('#activity_regions option').filter(function () {
                                return jQuery(this).text() === val;
                            }).attr('selected', true);
                            jbdUtils.updateChosenSelect('#activity_regions');
                        }

                        if (att == 'locality') {
                            //TODO global reference (defined in edit views)
                            updateCities(function () {
                                jQuery('#activity_cities option').filter(function () {
                                    return jQuery(this).text() === val;
                                }).attr('selected', true);
                                jbdUtils.updateChosenSelect('#activity_cities');
                            });
                        }
                    });
                }
            }
        }
        jbdUtils.updateChosenSelect('#country');
    }

    /**
     * Validates the Application Settings section on submit button
     *
     * @param validateNonVisible boolean validates the hidden form elements
     * @param validateRichText boolean validates the inputs that contain rich text
     * @param formName string name of the form that will be validated
     * @returns {jQuery}
     */
    validateAppSettingsForm(validateNonVisible, validateRichText, formName) {
        formName = formName || "item-form";
        let validationResult = false;

        jQuery("#" + formName).validationEngine('attach', {
            validateNonVisibleFields: validateNonVisible,
        });

        validationResult = jQuery("#" + formName).validationEngine('validate');

        if (!validationResult) {
            jbdUtils.showSettingsValidationError(formName);
        }

        return validationResult;
    }

    /**
     * Validates the form elements based on the parameters passed to the function
     *
     * @param validateNonVisible boolean validates the hidden form elements
     * @param validateRichText boolean validates the inputs that contain rich text
     * @param customRuleHook string custom function to run if it is needed
     * @returns {boolean}
     */
    validateCmpForm(validateNonVisible, validateRichText, customRuleHook) {
        if (typeof customRuleHook !== "undefined") {
            customRuleHook();
        }

        if (validateRichText) {
            jbdUtils.validateRichTextEditors();
        }

        jbdUtils.validateMultiSelects();
        jbdUtils.validateSingleSelects();
        let isError = jQuery("#item-form").validationEngine('validate', {validateNonVisibleFields: validateNonVisible});
        return !isError;
    }

    /**
     * Show the validation error to the form which is passed on parameters.
     *
     * @param formName string name of the form which has been checked for validation
     */
    showValidationError(formName) {
        formName = formName || "item-form";
        jQuery("#validation-error").show(500);

        setTimeout(function () {
            jQuery("#validation-error").hide(700);
        }, 5000);

        setTimeout(function () {
            for (let i = 1; i <= 6; i++) {
                if (jQuery("#edit-tab" + i + " div.formError").length) {
                    console.log("show tab " + i);
                    jbdTabs.openTab(i);
                    break;
                }
            }
            setTimeout(function () {
                jQuery('#' + formName).validationEngine('updatePromptsPosition');
            }, 500);
        }, 1500);
    }

    /**
     * Show the validation error to general settings section after it is been checked
     *
     * @param formName string name of the form which has been checked for validation
     */
    showSettingsValidationError(formName) {
        formName = formName || "item-form";
        jQuery("#validation-error").show(500);

        setTimeout(function () {
            jQuery("#validation-error").hide(700);
        }, 5000);
        let numItems = jQuery('.focus_validate').length;
        setTimeout(function () {
            for (let i = 1; i <= numItems; i++) {
                if (jQuery(".panel_" + i + "_content div.formError").length) {
                    console.log("show tab " + i);
                    jbdUtils.openSettingsTab(i);
                    break;
                }
            }
            setTimeout(function () {
                jQuery('#' + formName).validationEngine('updatePromptsPosition');
            }, 500);
        }, 1500);
    }

    /**
     * Open the corresponding tab after it has been validated and there is an error.
     *
     * @param tab int id of the tab that will be opened
     */
    openSettingsTab(tab) {
        jQuery("#adminForm").validationEngine('detach');
        let validationResult = jQuery("#adminForm").validationEngine('validate');

        if (!validationResult) {
            return;
        }

        jQuery('.panel_' + tab).click();
    }

    /**
     * Validates form tabs of the form with id item-form and displays the validations for it.
     *
     * @param validateNonVisible boolean validates the hidden form elements
     * @param validateRichText boolean validates the inputs that contain rich text
     * @returns {jQuery}
     */
    validateTabs(validateNonVisible, validateRichText) {
        let validationResult = false;

        if (jbdUtils.getProperty('isMultilingual')) {
            jQuery(".tab-" + jbdUtils.getProperty("defaultLang")).each(function () {
                jQuery(this).click();
            });
        }

        if (validateRichText) {
            this.validateRichTextEditors();
        }

        jbdUtils.validateMultiSelects();
        jQuery("#item-form").validationEngine('attach', {
            validateNonVisibleFields: validateNonVisible,
        });

        validationResult = jQuery("#item-form").validationEngine('validate');

        if (!validationResult) {
            this.showValidationError();
        }

        return validationResult;
    }

    /**
     * Validates all rich text editors on the form. Mostly called on javascript functions
     */
    validateRichTextEditors() {
        let lang = '';

        if (jbdUtils.getProperty('isMultilingual')) {
            lang += '_' + jbdUtils.getProperty('langTab');
            jQuery(".tab-" + jbdUtils.getProperty('defaultLang')).each(function () {
                jQuery(this).click();
            });

            jQuery(".tab_description_" + jbdUtils.getProperty('defaultLang')).click();
        }

        jQuery(".editor").each(function () {
            let textarea = jQuery(this).find('textarea');
            tinyMCE.triggerSave();
            if (textarea.attr('id') == 'description' + lang) {
                if (jQuery.trim(textarea.val()).length > 0) {
                    if (jQuery(this).hasClass("validate[required]"))
                        jQuery(this).removeClass("validate[required]");
                }
                else {
                    if (!jQuery(this).hasClass("validate[required]"))
                        jQuery(this).addClass("validate[required]");
                }
            }
        });
    }

    /**
     * Opens a link in new tab. Link is passed through function parameters
     *
     * @param link string is the link that will need to be accessed
     */
    showItem(link) {
        let win = window.open(link, '_blank');
        win.focus();
    }

    /**
     * When called opens the rest of the text that is hidden.
     */
    readMore() {
        jQuery("#general-info").removeClass("collapsed");
        jQuery(".read-more").hide();
    }

    /**
     * Is called for the show more or show less on the search filter on search page. It displays the rest of the filters
     * when clicked show more or hide them when clicked show less
     */
    applyReadMore() {
        let showChar = 70;  // How many characters are shown by default
        let ellipsestext = "...";
        let moretext = "Show more";
        let lesstext = "Show less";

        jQuery('.read-more').each(function () {
            let content = jQuery(this).html();

            if (content.length > showChar) {
                let c = content.substr(0, showChar);
                let h = content.substr(showChar, content.length - showChar);

                let html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="javascript:void(0)" class="morelink" >' + moretext + '</a></span>';

                jQuery(this).html(html);
            }
        });

        jQuery(".morelink").click(function () {
            if (jQuery(this).hasClass("less")) {
                jQuery(this).removeClass("less");
                jQuery(this).html(moretext);
            } else {
                jQuery(this).addClass("less");
                jQuery(this).html(lesstext);
            }
            jQuery(this).parent().prev().toggle();
            jQuery(this).prev().toggle();
            return false;
        });
    }

    /**
     * Calcualates the length of the text in text area. Is used more for the calculations of the descriptions
     */
    calculateLength() {
        let obj = jQuery("#description");

        let max = parseInt(obj.attr('maxlength'));
        if (obj.val().length > max) {
            obj.val(obj.val().substr(0, obj.attr('maxlength')));
        }

        jQuery("#descriptionCounter").val((max - obj.val().length));
    }

    /**
     * Calcualates the length of the text in text area. Is used more for the calculations of the short descriptions
     */
    calculateLengthShort() {
        let obj = jQuery("#short_description");

        let max = parseInt(obj.attr('maxlength'));
        if (obj.val().length > max) {
            obj.val(obj.val().substr(0, obj.attr('maxlength')));
        }

        jQuery("#descriptionCounterShort").val((max - obj.val().length));
    }

    /**
     * Validates chosen multi select. Called on the javascript functions
     */
    validateMultiSelects() {
        let chosenSelector = '.chzn-container-multi';
        if (!jQuery(chosenSelector).length) {
            chosenSelector = '.chosen-container-multi';
        }

        jQuery(chosenSelector).each(function () {
            let id = jQuery(this).attr('id');
            let selectId = id.substr(0, id.lastIndexOf("_"));

            if (jQuery('#' + selectId).hasClass('validate[required]') || jQuery('#' + id).hasClass('validate[required]')) {
                let values = jQuery('#' + selectId).chosen().val();
                if (typeof values === 'undefined' || values == null || values.length == 0) {
                    if (!jQuery('#' + id).hasClass('validate[required]')) {
                        jQuery('#' + id).addClass('validate[required]');
                    }
                    jQuery('#' + selectId).removeClass('validate[required]');
                }
                else {
                    jQuery('#' + id).removeClass('validate[required]');
                    jQuery('#' + selectId).addClass('validate[required]');
                }
            }
        });
    }

    /**
     * Validates chosen select. Called on the javascript functions
     */
    validateSingleSelects() {
        let chosenSelector = '.chzn-container-single';
        if (!jQuery(chosenSelector).length) {
            chosenSelector = '.chosen-container-single';
        }

        jQuery(chosenSelector).each(function () {
            let id = jQuery(this).attr('id');
            let selectId = id.substr(0, id.lastIndexOf("_"));

            if (jQuery('#' + selectId).hasClass('validate[required]') || jQuery('#' + id).hasClass('validate[required]')) {
                let values = jQuery('#' + selectId).chosen().val();
                if (typeof values === 'undefined' || values == null || values.length == 0) {
                    if (!jQuery('#' + id).hasClass('validate[required]')) {
                        jQuery('#' + id).addClass('validate[required]');
                    }
                    jQuery('#' + selectId).removeClass('validate[required]');
                }
                else {
                    jQuery('#' + id).removeClass('validate[required]');
                    jQuery('#' + selectId).addClass('validate[required]');
                }
            }
        });
    }

    //************--End Edit Views--***********************//


    //***************--Front End Views--*******************//

    /**
     * Validates the form given by the parameter. Mostly the forms on the component has id = item-form and after that
     * it submits the form.
     *
     * @param formId string the id of the form
     */
    saveForm(formId = 'item-form') {
        let isError = true;
        jQuery('#' + formId).validationEngine('detach');

        isError = jQuery('#' + formId).validationEngine('validate');
        jQuery('#' + formId).validationEngine('attach');
        if (!isError) {
            return;
        }

        jQuery("#" + formId + " button").each(function () {
            jQuery(this).attr("disabled", "disabled");
        });

        //loading button animation if validation is OK
        jQuery("#" + formId + " .jbd-commit").addClass("loader");

        document.getElementById(formId).submit();
    }

    /**
     * Opens login modal.
     */
    showLoginNotice() {
        jQuery('#login-notice').jbdModal();
    }

    /**
     * When called it displays or hides the map in the map container on the search listing
     * @param display
     */
    showMap(display) {
        if (!jQuery("#map-link").hasClass("active")) {
            jQuery("#companies-map-container").show();
            jQuery("#map-link").addClass("active");
        } else {
            jQuery("#companies-map-container").hide();
            jQuery("#map-link").removeClass("active");
        }

        mapInstance.initialize();
    }

    /**
     * Hides the map on listing detail view
     */
    hideMap() {
        jQuery("#company-map-holder").hide();
    }

    /**
     * Initialize the map autocomplete on search view. When a location is searched and selected it fills the lat and long
     * on the form parameters
     *
     * @param token string token to check and identify which module is used on a form
     * @param preventSubmit boolean prevents the form submit if true
     * @param limitedCountries json it contains the countries that are selected on which the search can be done
     */
    initializeSearchAutocomplete(token, preventSubmit, limitedCountries) {
        let element = document.getElementsByClassName('zipcode-' + token)[0];

        jQuery(document).ready(function () {
            JBDMapHelper.initAutocomplete(element, function (place) {
                jQuery("#geo-latitude").val(place['latitude']);
                jQuery("#geo-longitude").val(place['longitude']);
                jQuery("#location-detected").val("1");
            }, preventSubmit, false, limitedCountries);
        });
    }

    /**
     * Used when filter rule is called to save the category selected on the form parameters. The selected category will
     * be set or replaced based on the category selected
     *
     * @param categorySet boolean if true get the category selected on the select box otherwise get the one on the parameters
     * @param categId int category id passed on the parameters that needs to be saved
     */
    saveSelectedCategory(categorySet, categId) {
        let catId;
        let checked = jQuery("#search-filter input[type='checkbox']:checked");
        catId = checked.attr('id');

        if (categorySet) {
            catId = categId;
        }

        jQuery("#adminForm #categoryId").val(catId);
        jQuery("#adminForm input[name=limitstart]").val(0);
    }

    /**
     * Add the selected category to categoryId field on the form
     *
     * @param categoryId int category id that will be saved
     */
    chooseCategory(categoryId) {
        if (categoryId.toString().substring(0, 3) == "chk") {
            categoryId = categoryId.substring(3);
        }

        categoryId = categoryId.toString().replace(";", "");
        jQuery("#adminForm #categoryId").val(categoryId);
        jQuery("#adminForm input[name=limitstart]").val(0);
        jQuery("#adminForm").submit();
    }

    /**
     * When a rule is removed from the search filter on search view then it will call this function to remove the rule
     * from the form hidden field
     *
     * @param type string the type of the rule removed
     */
    removeSearchRule(type) {
        if (type == "province")
            jQuery("#adminForm #province-search").val("");
        if (type == "type")
            jQuery("#adminForm #type-search").val("");
        if (type == "zipcode") {
            jQuery("#adminForm #zipcode").val("");
            jQuery("#adminForm #radius").val("");
        }
        if (type == "location") {
            jQuery("#adminForm #geo-latitude").val("");
            jQuery("#adminForm #geo-longitude").val("");
        }

        if (type == "country")
            jQuery("#adminForm #country-search").val("");
        if (type == "region")
            jQuery("#adminForm #region-search").val("");
        if (type == "city")
            jQuery("#adminForm #city-search").val("");
        if (type == "keyword")
            jQuery("#adminForm #searchkeyword").val("");
        if (type == "startDate")
            jQuery("#adminForm #startDate").val("");
        if (type == "endDate")
            jQuery("#adminForm #endDate").val("");
        if (type == "minprice")
            jQuery("#adminForm #minprice-search").val("");
        if (type == "maxprice")
            jQuery("#adminForm #maxprice-search").val("");

        jQuery("#adminForm").submit();
    }

    /**
     * Its called on the horizontal search filter and removed the attribute condition from filter
     * After removing it then submits the form.
     *
     * @param attributeId int attribute ID
     */
    removeAttrCond(attributeId) {
        jQuery("input[name=attribute_" + attributeId + "]").remove();
        jQuery("#attribute_" + attributeId).val("");
        jQuery("#adminForm").submit();
    }

    /**
     * After an element from search filter is selected then it calls this function to save the rule and submits the form
     *
     * @param type string type of the rule
     * @param id int the selected value of the rule
     * @param categorySet boolean if its set to yes get the category from module
     * @param categId int category Id that is selected
     */
    addFilterRule(type, id, categorySet, categId) {
        let val = type + '=' + id + ';';
        if (jQuery("#selectedParams").val().length > 0) {
            jQuery("#selectedParams").val(jQuery("#selectedParams").val() + val);
        } else {
            jQuery("#selectedParams").val(val);
        }

        if (categorySet) {
            jQuery("#filter_active").val("1");
        }

        jQuery("#adminForm input[name=limitstart]").val(0);
        jbdUtils.saveSelectedCategory(categorySet, categId);
        jQuery("#adminForm").submit();
    }

    /**
     * Remove the selected search filter option and submits the form
     *
     * @param type string type of the rule
     * @param id int the selected value of the rule
     * @param categorySet boolean if its set to yes get the category from module
     * @param categId int category Id that is selected
     */
    removeFilterRule(type, id, categorySet, categId) {
        let val = type + '=' + id + ';';
        let str = jQuery("#selectedParams").val();
        jQuery("#selectedParams").val((str.replace(val, "")));
        jQuery("#filter_active").val("1");
        jbdUtils.saveSelectedCategory(categorySet, categId);

        if (type == "city")
            jQuery("#adminForm #city-search").val("");
        if (type == "region")
            jQuery("#adminForm #region-search").val("");
        if (type == "country")
            jQuery("#adminForm #country-search").val("");
        if (type == "type")
            jQuery("#adminForm #type-search").val("");

        jQuery("#adminForm").submit();
    }

    /**
     * Reset the search filter on search Results
     *
     * @param resetCategories boolean reset also category selection if it is true
     * @param isCompany boolean set true if we are on companies search view.
     */
    resetFilters(resetCategories, isCompany = false) {
        jQuery("#selectedParams").val("");
        if (resetCategories) {
            jQuery("#categories-filter").val("");
            jQuery("#categoryId").val("");
            jQuery("#resetSearch").val("1");
            
        } else {
            if (!isCompany) {
                this.saveSelectedCategory();
            } else {
                jbdListings.saveSelectedCategory();
            }
        }
        jQuery("#adminForm #categoryId").val("");

        jQuery("#adminForm #searchkeyword").val("");
        jQuery("#adminForm #zipcode").val("");
        jQuery("#adminForm #city-search").val("");
        jQuery("#adminForm #region-search").val("");
        jQuery("#adminForm #province-search").val("");
        jQuery("#adminForm #minprice-search").val("");
        jQuery("#adminForm #maxprice-search").val("");
        jQuery("#adminForm #country-search").val("");
        jQuery("#adminForm #type-search").val("");
        jQuery("#adminForm #province-search").val("");
        jQuery("#adminForm #radius").val("");
        jQuery("#adminForm #startDate").val("");
        jQuery("#adminForm #endDate").val("");
        jQuery("#adminForm #filter-by-fav").val("");
        jQuery("#adminForm #resetSearch").val("1");
        jQuery("input[id*='attribute_']").val("");
        jQuery("input[name*='attribute_']").remove();
        
        jQuery("#adminForm").submit();
    }

    /**
     * When a value is clicked from more filters then this function is called to add or remove the rule
     *
     * @param val string the filter value that is checked
     */
    checkMoreFilterRule(val) {
        let selected = jQuery('input[name=' + val + ']:checked').length;

        if (selected > 0) {
            jbdUtils.addMoreFilter(val);
        } else {
            jbdUtils.removeMoreFilter(val);
        }
    }

    /**
     * If the value from more filter is checked then it will be added for the search params
     *
     * @param val string the value that is selected
     */
    addMoreFilter(val) {
        val = val + ';';
        if (jQuery("#moreParams").val().length > 0) {
            jQuery("#moreParams").val(jQuery("#moreParams").val() + val);
        } else {
            jQuery("#moreParams").val(val);
        }

        jQuery("#adminForm input[name=limitstart]").val(0);
    }

    /**
     * If the value from more filter is checked then it will be removed for the search params
     *
     * @param val string the value that is selected
     */
    removeMoreFilter(val) {
        val = val + ';';
        let str = jQuery("#moreParams").val();
        jQuery("#moreParams").val((str.replace(val, "")));
    }

    /**
     * Empty the search params related to the more filter
     */
    resetMoreFilter() {
        jQuery("#moreParams").val("");
        jQuery("#adminForm").submit();
    }

    /**
     * Add selected category to search params on listing search view
     *
     * @param catId int category id selected
     */
    addFilterRuleCategory(catId) {
        catId = catId + ";";
        if (jQuery("#categories-filter").val().length > 0) {
            jQuery("#categories-filter").val(jQuery("#categories-filter").val() + catId);
        } else {
            jQuery("#categories-filter").val(catId);
        }
        jQuery("#filter_active").val("1");
        jQuery("#adminForm input[name=limitstart]").val(0);
        this.chooseCategory(catId);
    }

    /**
     * Removes the selected category from search params on listing search view
     *
     * @param catId int category id selected
     */
    removeFilterRuleCategory(catId) {
        let categoryId = catId + ";";
        let str = jQuery("#categories-filter").val();
        jQuery("#categories-filter").val((str.replace(categoryId, "")));

        jQuery("#categorySearch").val("");
        jQuery("input[name='categorySearch']").each(function () {
            jQuery(this).val("");
        });

        jQuery("#filter_active").val("1");
        let checked = jQuery("#filterCategoryItems input[type='checkbox']:checked");

        if (checked.length > 0) {
            checked.each(function () {
                let id = jQuery(this).attr('id');
                if (id != catId) {
                    jbdUtils.chooseCategory(id);
                    return false;
                }
            });
        } else if (checked.length == 0) {
            let categoryIds = jQuery("#categories-filter").val();
            categoryId = categoryIds.slice(0, categoryIds.length - 1);
            let start = categoryId.lastIndexOf(';') + 1;
            if (start == -1) {
                start = 0;
            }

            categoryId = categoryId.slice(start, categoryId.length);
            jbdUtils.chooseCategory(categoryId);
        }
    }

    /**
     * Shows more params of search filter when more is selected
     *
     * @param div string div name
     * @param lessButton string button id
     */
    showMoreParams(div, lessButton) {
        div = "#" + div;
        let less = "#" + lessButton;
        jQuery(div).removeAttr("style");
        jQuery(less).css("display", "none");
    }

    /**
     * Shows less params of search filter when less is selected
     *
     * @param div string div name
     * @param moreButton string button id
     */
    showLessParams(div, moreButton) {
        div = "#" + div;
        let more = "#" + moreButton;
        jQuery(div).css("display", "none");
        jQuery(more).removeAttr("style");
    }

    /**
     * Initialize image slider for the listing details view
     *
     * @param params array handles all the settings for the slider
     */
    initSlider(params) {
        let sliderId = '#slider';
        let sliderContentId = '#slider-content';
        if (typeof params['sliderId'] !== 'undefined') {
            sliderId += '-' + params['sliderId'];
            sliderContentId += '-' + params['sliderId'];
        }

        let autoplay = false;
        if (typeof params['autoplay'] !== 'undefined') {
            autoplay = params['autoplay'];
        }

        let autoplaySpeed = 0;
        if (typeof params['autoplaySpeed'] !== 'undefined') {
            autoplaySpeed = params['autoplaySpeed'];
        }

        let nrVisibleItems = 0;
        if (typeof params['nrVisibleItems'] !== 'undefined') {
            nrVisibleItems = parseInt(params['nrVisibleItems']);
        }

        let nrVisibleItems1024 = 3;
        if (nrVisibleItems1024 > nrVisibleItems) {
            nrVisibleItems1024 = nrVisibleItems;
        }

        let nrVisibleItems600 = 2;
        if (nrVisibleItems600 > nrVisibleItems) {
            nrVisibleItems600 = nrVisibleItems;
        }

        let nrItemsToScrool = 0;
        if (typeof params['nrItemsToScrool'] !== 'undefined') {
            nrItemsToScrool = parseInt(params['nrItemsToScrool']);
        }

        let rtl = false;
        if (typeof params['rtl'] !== 'undefined') {
            rtl = params['rtl'];
        }

        let infinite = true;
        //if (typeof params['infinite'] !== 'undefined')
        //	infinite = params['infinite'];

        let centerMode = false;
        if (typeof params['centerMode'] !== 'undefined') {
            centerMode = params['centerMode'];
        }

        let variableWidth = false;
        if (typeof params['variableWidth'] !== 'undefined') {
            variableWidth = params['variableWidth'];
        }

        jQuery(sliderId).slick({
            dots: false,
            prevArrow: '<a class="controller-prev" href="javascript:;"><span><i class="la la-angle-left"></i></span></a>',
            nextArrow: '<a class="controller-next" href="javascript:;"><span><i class="la la-angle-right"></i></span></a>',
            customPaging: function (slider, i) {
                return '<a class="controller-dot" href="javascript:;"><span><i class="la la-circle"></i></span></a>';
            },
            autoplay: autoplay,
            autoplaySpeed: autoplaySpeed,
            speed: 300,
            slidesToShow: nrVisibleItems,
            slidesToScroll: nrItemsToScrool,
            infinite: infinite,
            centerMode: centerMode,
            variableWidth: variableWidth,
            rtl: rtl,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: nrVisibleItems1024,
                        slidesToScroll: nrVisibleItems1024,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: nrVisibleItems600,
                        slidesToScroll: nrVisibleItems600
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }]
        });
    }

    /**
     * Shows add bookmark modal
     *
     * @param requiresLogin boolean if not logged in the log in popup will be shown
     * @param customId string modal id that will be open
     */
    addBookmark(requiresLogin, customId) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            let id = 'add-bookmark';
            if (typeof customId !== 'undefined') {
                id = customId;
            }

            jQuery('#' + id).jbdModal();
        }
    }

    /**
     * Shows update bookmark modal
     *
     * @param requiresLogin boolean if not logged in the log in popup will be shown
     * @param customId string modal id that will be open
     */
    showUpdateBookmarkDialog(requiresLogin, customId) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            let id = 'update-bookmark';
            if (typeof customId !== 'undefined') {
                id = customId;
            }

            jQuery('#' + id).jbdModal();
        }
    }

    /**
     * Removes bookmark
     *
     * @param type string type of bookmark
     */
    removeBookmark(type) {
        jQuery("#updateBookmarkFrm #task").val(type + ".removeBookmark");
        jQuery("#updateBookmarkFrm").submit();
    }

    /**
     * Shows terms and condition modal
     */
    showTerms() {
        jQuery('#conditions').jbdModal();
    }

    //************--End Front End Views--*****************//

    /**
     * Returns the base name from the path
     *
     * @param path string path of the file
     * @returns {T}
     */
    basename(path) {
        return path.split('/').reverse()[0];
    }

    /**
     * Used to submit the form on Manage Company Announcement. Add an Announcement
     */
    addDirAnnouncement() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyannouncement.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Used to submit the form on Manage Company Announcement. Removes an Announcement
     */
    deleteDirAnnouncement(id) {
        jQuery("#id").val(id);

        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_ANNOUNCEMENT_CONFIRM_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val("managecompanyannouncements.deleteAnnouncement");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Used to submit the form on Manage Company Price List. Adds a Price List
     */
    addDirPriceList() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanypricelist.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Used to submit the form on Manage Company Price List. Removes a Price List
     */
    deleteDirPriceList(id) {
        jQuery("#id").val(id);

        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_PRICE_LIST_CONFIRM_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val("managecompanypricelists.deletePriceList");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Used to submit the form on Manage Payment Processor. Adds a processor
     */
    addPaymentProcessor() {
        jQuery("#id").val(0);
        jQuery("#task").val("managepaymentprocessor.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Used to submit the form on Manage Payment Processor. Removes a processor
     */
    deletePaymentProcessor(processorId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_PAYMENT_PROCESSOR_CONFIRM_DELETE"))) {
            jQuery("#id").val(processorId);
            jQuery("#task").val("managepaymentprocessors.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Called to handle ajax call for approving or publishing an item by ajax on list views.
     *
     * When this function is called it changes the value on the db and then by the response it get changes also the
     * color on the start of the row for that items.
     *
     * @param cid int id of the the row which have item
     * @param itemId int id of the item with the status that will be changed
     * @param task string task name
     */
    listItemTaskAjax(cid, itemId, task) {

        let iState = jQuery("#" + itemId).prop('checked');

        let cidArray = [];
        cidArray[0] = jQuery("#" + cid).val();

        let url = jbdUtils.getProperty('url') + '&task=' + task;
        jQuery.ajax({
            type: "GET",
            url: url,
            data: {
                cid: cidArray,
                id: cidArray[0],
                itemId: itemId,
                ajax: true,
                status: iState,
            },
            dataType: 'json',
            success: function (data) {
                if (data.error) {
                    jQuery("#" + itemId).prop('checked', !iState);
                    return;
                }

                if (!Array.isArray(data.cid)) {
                    let cida = [data.cid];
                    data.cid = cida;
                }

                if (task == 'categories.unpublish') {
                    for (let i = 0; i < data.cid.length; i++) {
                        jQuery("#jtoggle-state-" + data.cid[i]).prop('checked', false);
                        let text = document.getElementById('jtoggle-state-' + data.cid[i]).getAttribute('onclick');
                        let res = text.replace("unpublish", "publish");
                        document.getElementById('jtoggle-state-' + data.cid[i]).setAttribute('onclick', res);
                    }
                } else if (task == 'categories.publish') {
                    for (let i = 0; i < data.cid.length; i++) {
                        jQuery("#jtoggle-state-" + data.cid[i]).prop('checked', true);
                        let text = document.getElementById('jtoggle-state-' + data.cid[i]).getAttribute('onclick');
                        let res = text.replace("publish", "unpublish");
                        document.getElementById('jtoggle-state-' + data.cid[i]).setAttribute('onclick', res);
                    }
                }

                for (let i = 0; i < data.cid.length; i++) {
                    if (document.getElementById('jtoggle-state-' + data.cid[i]) && document.getElementById('jtoggle-approval-' + data.cid[i])) {
                        if (jQuery("#jtoggle-state-" + data.cid[i]).prop('checked') && jQuery("#jtoggle-approval-" + data.cid[i]).prop('checked')) {
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-success");
                        } else {
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-success");
                        }

                    } else if (document.getElementById('jtoggle-state-' + data.cid[i])) {
                        if (jQuery("#jtoggle-state-" + data.cid[i]).prop('checked')) {
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-success");
                        } else {
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-success");
                        }
                    }else if(document.getElementById('jtoggle-approval-' + data.cid[i])){
                        if (jQuery("#jtoggle-approval-" + data.cid[i]).prop('checked')) {
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-success");
                        } else {
                            jQuery("#item-status-" + data.cid[i]).addClass("bg-danger");
                            jQuery("#item-status-" + data.cid[i]).removeClass("bg-success");
                        }
                    }
                }
            }
        });
    }

    /**
     * check if the string passed is empty
     *
     * @param str string text that will be checked
     * @returns {boolean}
     */
    isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }

    /**
     * Check all options in a select
     *
     * @param elementId string id of the select box
     */
    checkAll(elementId) {
        jQuery('#'+elementId+' option').prop('selected', true);
        jbdUtils.updateChosenSelect('#'+elementId+' option');
    }

    /**
     * Unchecks all options of a jquery multiselect
     *
     * @param elementId string ID of the element
     */
    uncheckAll(elementId) {
        jQuery('#'+elementId+' option').prop('selected', false);
        jbdUtils.updateChosenSelect('#'+elementId+' option');
    }

    /**
     * Unchecks all categories for edit views
     *
     * @param mainCategoryId string ID of the mainCategory input
     * @param subCategoriesId string ID of the subCategories input
     */
    uncheckAllCategories(mainCategoryId = 'main_subcategory', subCategoriesId = 'categories') {
        let mainCatElement = '#'+mainCategoryId;
        jQuery(mainCatElement).empty();
        jbdUtils.updateChosenSelect(mainCatElement+' option');

        let subCatElement = '#'+subCategoriesId;
        jQuery(subCatElement+' option').attr('selected', false);
        jbdUtils.updateChosenSelect(subCatElement);

        //TODO do we still need this?
        if (jbdUtils.getProperty("enable_attribute_category") == 1) {
            resetAttributes();
        }
    }

    /**
     * Truncate text with javascript by the limit given to parameters
     *
     * @param text string text that will be truncated
     * @param id int id for the show more text for a particular text
     * @param limit int limit of chars that will be shown
     * @returns {string|*}
     */
    truncate(text, id, limit) {
        let truncatedText;

        if (id.length > 10) {
            id = id.slice(15, id.length);
        }

        if (text.length <= limit) {
            return text;
        } else if (text.length > limit) {
            truncatedText = text.slice(0, limit) + '<span>...</span>';
            truncatedText += '<a href="javascript:void(0)" onClick=\'jbdUtils.showFullText("' + id + '")\' class="more" id="more' + id + '">' + Joomla.JText._("LNG_READ_MORE") + '</a>';
            truncatedText += '<span style="display:none;" id="more-text">' + text.slice(limit, text.length) + '</span>';

            return truncatedText;
        }
    }

    /**
     * Print a windows page based on the url and settings given.
     *
     * @param url string url that will be printed
     * @param params array settings for the function
     */
    printItem(url, params = null) {
        let width = '1050';
        let height = '700';
        let timeout = 2000;

        if (params != null) {
            if (typeof params['width'] !== 'undefined') {
                width = params['width'];
            }

            if (typeof params['height'] !== 'undefined') {
                height = params['height'];
            }

            if (typeof params['timeout'] !== 'undefined') {
                timeout = params['timeout'];
            }
        }

        let winref = window.open(url, 'windowName', 'width='+width+',height='+height);
        winref.window.focus();
        setTimeout(function () {
            winref.window.print();
        }, timeout);
    }

    /**
     * Show full text from the truncated one
     *
     * @param id string id of he elemnt with the hidden text
     */
    showFullText(id) {
        jQuery('#more' + id).next().show();
        jQuery('#more' + id).prev().remove();
        jQuery('#more' + id).remove();
    }

    /**
     * Change order of the items shown
     *
     * @param orderField int value of the order field as how they will be ordered on front
     */
    changeOrder(orderField) {
        jQuery("#orderBy").val(orderField);
        jQuery("#adminForm").submit();
    }

    /**
     * Change search Radius on search view
     *
     * @param radius double new radius which will be used to search
     */
    changeRadius(radius) {
        jQuery("#radius").val(radius);
        jQuery("#adminForm").submit();
    }

    /**
     * Compare versions of component installed and required.
     *
     * @param installed duoble version installed already
     * @param required double version that is up to date
     * @returns {boolean}
     */
    compareVersions (installed, required) {
        let a = installed.split('.');
        let b = required.split('.');

        for (let i = 0; i < a.length; ++i) {
            a[i] = Number(a[i]);
        }
        for (let i = 0; i < b.length; ++i) {
            b[i] = Number(b[i]);
        }
        if (a.length == 2) {
            a[2] = 0;
        }

        if (a[0] > b[0]) return true;
        if (a[0] < b[0]) return false;

        if (a[1] > b[1]) return true;
        if (a[1] < b[1]) return false;

        if (a[2] > b[2]) return true;
        if (a[2] < b[2]) return false;

        return true;
    }

    /**
     * Remove Offer selling field option
     *
     * @param index string index of the div that will be removed
     */
    deleteOfferSellingOption(index) {
        var count = jQuery('.selling-option-fields');

        if (count.length > 1) {
            jQuery('#' + index).remove();
        } else {
            jQuery('#customOptionsContent #' + index).find(':input').each(function() {
                jQuery(this).val('');
            });
        }
    }

    /**
     * Remove Payment Processor field option
     *
     * @param id string id of the div that will be removed
     */
    deleteProcessorOption(id) {
        var count = jQuery('.processor-fields');

        if (count.length > 1) {
            jQuery('#processor_field_' + id).remove();
        } else {
            var nameInput = jQuery('#processor_field_' + id + ' #column_name').find('input');
            nameInput.val('');
            nameInput.attr('type', 'text');
            nameInput.attr('placeholder', Joomla.JText._("LNG_COLUMN_NAME"));
            jQuery('#processor_field_' + id + ' .hasTooltip').empty();

            var valueInput = jQuery('#processor_field_' + id + ' #column_value').find('input');
            valueInput.val('');
            valueInput.attr('placeholder', Joomla.JText._("LNG_COLUMN_VALUE"));

            jQuery('#processor_field_' + id + ' #delete_processor_field_' + id).empty();
        }
    }

    /**
     * Adds a new Offer Selling option
     *
     * @param currentDivClass string class of the last div after which the new one will be added
     */
    addOfferSellingOption() {
        var lastElement = jQuery('#customOptionsContent div.selling-option-fields:last');
        var lastElementId = jQuery('#customOptionsContent div.selling-option-fields:last').attr('id');
        var lastIndex = lastElementId.split('-')[1];
        var newIdex = lastIndex + 1;

        var deleteButton = '';
        deleteButton += "<div id=\"delete_offer_selling_option\">\n" +
            "                <a href=\"javascript:void(0)\" class=\"btn btn-xs btn-danger btn-panel\" onclick=\"jbdUtils.deleteOfferSellingOption('options-"+newIdex+"')\">\n" +
            "                    <i class=\"la la-trash\"></i>\n" +
            "                </a>\n" +
            "            </div>";


        jQuery('#'+lastElementId).clone().prop('id', 'options-' + newIdex).insertAfter('#'+lastElementId);
        jQuery('#options-' + newIdex).find(':input').each(function() {
            if (this.type != 'hidden'){
                jQuery(this).val('');
            }
        });

        jQuery('#options-' + newIdex + ' .deleteButton').html(deleteButton);
    }

    /**
     * Adds a new Payment Processor field option
     *
     * @param id string id of the last div after which the new one will be added
     */
    addProcessorOption(id) {
        id = parseInt(id);
        var newId = id + 1;

        var deleteButton = '';
        deleteButton += '<a href="javascript:void(0)" class="btn btn-xs btn-danger btn-panel" onclick="jbdUtils.deleteProcessorOption(' + newId + ')">';
        deleteButton += '<i class="la la-trash"></i>';
        deleteButton += '</a>';

        var fields = jQuery('.processor-fields');
        var lastId = jQuery(fields[fields.length - 1]).attr('id').slice(-1);

        jQuery('#processor_field_'+lastId).clone().prop('id', 'processor_field_' + newId).insertAfter('#processor_field_' + lastId);
        jQuery('#processor_field_'+newId).addClass('new-field');
        var newNameField = jQuery('#processor_field_' + newId + ' #column_name').find('input');
        newNameField.attr('id', 'column_name_' + newId);
        newNameField.attr('type', 'text');
        newNameField.val('');
        newNameField.attr('placeholder', Joomla.JText._("LNG_COLUMN_NAME"));

        jQuery('#processor_field_' + newId + ' .hasTooltip').remove();
        jQuery('#processor_field_' + newId + ' #column_name_'+lastId).find('button').attr('id', 'column_name_' + newId + '_img');
        var newValueField = jQuery('#processor_field_' + newId + ' #column_value').find('input');
        newValueField.attr('id', 'column_value_' + newId);
        newValueField.attr('placeholder', Joomla.JText._("LNG_COLUMN_VALUE"));
        newValueField.val('');
        jQuery('#processor_field_' + newId + ' #column_value_'+lastId).find('button').attr('id', 'column_value_' + newId + '_img');
        jQuery('#processor_field_' + newId + ' #delete_processor_field_'+lastId).prop('id', 'delete_processor_field_' + newId);
        jQuery('#add_processor_field').find('a').attr('onclick', 'jbdUtils.addProcessorOption(\'' + newId + '\')');
        jQuery('#delete_processor_field_' + newId).html(deleteButton);

        jQuery('#add_processor_field' + parseInt(id)).remove();
    }

    /**
     * Resize iframe given by parameter to the size of content so it looses the scroll option
     *
     * @param iframe string frame that will be resized
     */
    resizeIframe(iframe) {
	    iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
    }

    /**
     * Adds payment processor fields by selected type
     *
     * @returns {boolean}
     */
    addProcessorFieldsHTML(){
        let container = jQuery('#payment_processor_fields');
        let url = jbdUtils.getAjaxUrl('getPaymentProcessorFields', 'paymentprocessor', 'managepaymentprocessor');

        let processorType = jQuery('#type').find('option:selected').val();

        if (typeof processorType === 'undefined' || processorType.length == 0) {
            console.warn('Processor type should be defined first!');
            return false;
        }

        container.empty();

        jQuery.ajax({
            type: "GET",
            data: {
                type: processorType
            },
            url: url,
            cache: false,
            success: function (data) {
                if (data.status == 1) {
                    container.append(data.data);
                } else {
                    console.warn(data.data);
                }
            }
        });
        
    }

    /**
     * Update the chosen selects after changes done on them
     *
     * @param item string the chosen select
     */
    updateChosenSelect(item){
        jQuery(item).trigger("liszt:updated");
        jQuery(item).trigger("chosen:updated");
    }

    /**
     * Render average rating on listing details view
     *
     * @param averageRating int rating that will be displayed (listing average rating)
     */
    renderReviewAverageRating(averageRating) {
        jQuery('.rating-average-review').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('.rating-average-review').rating('update', averageRating);
    }
}
    
jQuery.fn.center = function () {
    this.css("left", (jQuery(window).width() - this.width()) / 2 + jQuery(window).scrollLeft() + "px");
    return this;
};

//TODO change to ES6 and move to separate file
let JBDItemList = function () {
    this.element = null;
    this.status = true;
    this.delete = true;
    this.statusSelector = null;
    this.enabled = 1;
    this.disabled = 0;
    this.statusCallback = function () {
    };
    this.deleteCallback = function () {
    };
    this.deleteMsg = "Are you sure you want to delete this?";

    this.construct = function (element, params) {
        this.element = element;

        if (typeof params !== 'undefined') {
            if (typeof params['status'] !== 'undefined') {
                this.status = params['status'];
            }

            if (typeof params['delete'] !== 'undefined') {
                this.delete = params['delete'];
            }

            if (typeof params['statusSelector'] !== 'undefined') {
                this.statusSelector = params['statusSelector'];
            }

            if (typeof params['statusCallback'] !== 'undefined') {
                this.statusCallback = params['statusCallback'];
            }

            if (typeof params['deleteCallback'] !== 'undefined') {
                this.deleteCallback = params['deleteCallback'];
            }

            if (typeof params['enabled'] !== 'undefined') {
                this.enabled = params['enabled'];
            }

            if (typeof params['disabled'] !== 'undefined') {
                this.disabled = params['disabled'];
            }

            if (typeof params['deleteMsg'] !== 'undefined') {
                this.deleteMsg = params['deleteMsg'];
            }
        }

        this.init();
    };

    this.init = function () {
        var root = this.element;
        var list = root.find('.jbd-item-list');
        var items = list.find('.jbd-item');

        var self = this;
        items.each(function () {
            var actionDiv = jQuery(this).find('.jbd-item-actions');
            var id = self.getId(this);

            if (self.status) {
                var statusValue = self.getStatusValue(id);
                var statusBtn = self.getStatusButton(statusValue);

                if (!actionDiv.find('.jbd-item-status').length) {
                    actionDiv.append(statusBtn);
                    actionDiv.find('.jbd-item-status').click(function () {
                        self.changeStatus(this, id);
                    });
                }
            }

            if (self.delete) {
                var deleteBtn = self.getDeleteButton();

                if (!actionDiv.find('.jbd-item-delete').length) {
                    actionDiv.append(deleteBtn);
                    actionDiv.find('.jbd-item-delete').click(function () {
                        self.deleteItem(id)
                    });
                }
            }
        })
    };

    this.changeStatus = function (element, id) {
        var oldClass = 'la-check-circle';
        var newClass = 'la-ban';

        var oldVal = this.getStatusValue(id);
        if (oldVal == this.disabled) {
            oldClass = 'la-ban';
            newClass = 'la-check-circle';
        }

        jQuery(element).find('.la').removeClass(oldClass).addClass(newClass);

        this.statusCallback(id, oldVal);
    };

    this.getStatusButton = function (val) {
        var html = '';

        html += '<a href="javascript:void(0)" class="jbd-item-status">';
        if (val == this.enabled) {
            html += '  <i class="la la-check-circle"></i>';
        } else {
            html += '  <i class="la la-ban"></i>';
        }
        html += '</a>';

        return html;
    };

    this.deleteItem = function (id) {
        if (confirm(this.deleteMsg)) {
            jQuery('#jbd-item-' + id).remove();
        } else {
            return false;
        }

        this.deleteCallback(id);
    };

    this.getDeleteButton = function () {
        var html = '';
        html += '<a href="javascript:void(0)" class="jbd-item-delete">';
        html += '  <i class="la la-trash"></i>';
        html += '</a>';

        return html;
    };

    this.getId = function (element) {
        var item = jQuery(element).closest('.jbd-item').attr('id');

        return item.substr(9);
    };

    this.getStatusValue = function (id) {
        var statusElement;
        if (this.statusSelector.indexOf('#') > -1) {
            statusElement = jQuery(this.statusSelector + id);
        } else {
            statusElement = jQuery('#' + this.statusSelector + id);
        }

        return statusElement.val();
    };
};

jQuery.fn.jbdList = function (options) {
    let list = new JBDItemList();
    list.construct(this, options);
};

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};

let jbdUtils = new JBDUtils();;/**
 * JBD Abstract map class
 */
class JBDMapAbstract
{
    /**
     * Class constructor
     *
     * @param locations array with locations
     * @param params array with params
     * @param mapType int map type
     */
    constructor(locations, params, mapType)
    {
    	
        this.locations = locations;
        this.params = params;
        this.mapType = typeof mapType !== 'undefined' ? mapType : parseInt(jbdUtils.getProperty('mapType'));

        let map_zoom = jbdUtils.getProperty('mapDefaultZoom');
        if (typeof this.params !== 'undefined' && this.params != null) {
            // default to company
            let mapDivId = "company-map";
            if (typeof this.params['map_div'] !== 'undefined') {
                mapDivId = this.params['map_div'];
            }

            let mapId = '';
            if (typeof this.params['tmapId'] !== 'undefined') {
                mapId = this.params['tmapId'];
            }
            this.mapDiv = mapDivId + '' + mapId;

            if (typeof this.params['map_zoom'] !== 'undefined') {
                map_zoom = this.params['map_zoom'];
            }

            let map_width = '100%';
            let map_height = '450px';
            if (typeof this.params["map_width"] !== 'undefined') {
                map_width = this.params["map_width"];
            }
            if (typeof this.params["map_height"] !== 'undefined') {
                map_height = this.params["map_height"];
            }

            this.mapWidth = map_width;
            this.mapHeight = map_height;
        }

        this.zoom = map_zoom;
    }

    /**
     * Set map width
     *
     * @param width double map width
     */
    setMapWidth(width)
    {
        this.mapWidth = width;
    }

    /**
     * Set map height
     *
     * @param height double map height
     */
    setMapHeight(height)
    {
        this.mapHeight = height;
    }

    /**
     * Return boolean if there is map enabled or not
     *
     * @returns {boolean}
     */
    hasMap()
    {
        return typeof this.params['no_map'] === 'undefined';
    }

    /**
     * Return map object
     *
     * @returns {*}
     */
    getMap()
    {
        return this.map;
    }

    /**
     * Return map Id or null if nothing is found
     * @returns {null|*}
     */
    getMapId()
    {
        if (typeof this.params['tmapId'] !== 'undefined') {
            return this.params['tmapId'];
        } else {
            return null;
        }
    }

    /**
     * Return an instance of this class
     *
     * @returns {JBDMapAbstract}
     */
    getInstance()
    {
        return this;
    }
};/**
 * JBD Map helper class
 */
class JBDMapHelper
{

    /**
     * Load map script and initialize their instances with the locations and other params
     *
     * @param locations array locations with their lat and lang for each of them
     * @param params array params with settings
     * @param mapType int map type
     * @returns {null|boolean}
     */
    static loadMapScript(locations, params, mapType)
    {
        let mapObject = null;

        if (typeof jbd_map_gdpr !== "undefined") {
            if (!jbd_map_gdpr) {
                JBDMapHelper.openMapGDPRModal(locations, params, mapType);
                return false;
            }
        }

        if (typeof mapType === "undefined") {
            mapType = jbdUtils.getProperty('mapType');
        }

        mapType = parseInt(mapType);
        switch(mapType) {
            case JBDConstants.MAP_TYPE_GOOGLE:
                if (typeof JBDGoogleMap !== "undefined") {
                    mapObject = new JBDGoogleMap(locations, params, mapType);
                } else {
                    console.warn("Google Map object not found");
                }
                break;

            case JBDConstants.MAP_TYPE_BING:
                if (typeof JBDBingMap !== "undefined") {
                    mapObject = new JBDBingMap(locations, params, mapType);
                } else {
                    console.warn("Bing Map object not found");
                }
                break;

            case JBDConstants.MAP_TYPE_OSM:
                if (typeof JBDOpenMap !== "undefined") {
                    mapObject = new JBDOpenMap(locations, params, mapType);
                } else {
                    console.warn("OSM Map object not found");
                }
                break;

            default:
                if (typeof JBDGoogleMap !== "undefined") {
                    mapObject = new JBDGoogleMap(locations, params, mapType);
                } else {
                    console.warn("Google Map object not found");
                }
        }

        if (typeof JBDMapHelper.map_instances === 'undefined') {
            JBDMapHelper.map_instances = [];
        }

        mapObject.initialize();

        JBDMapHelper.map_instances[mapObject.getMapId()] = mapObject;

        return mapObject;
    }

    /**
     * Return map class based on the type that is requested
     *
     * @param mapType int map type
     * @returns {JBDGoogleMap|JBDBingMap|JBDOpenMap}
     */
    static getMapClass(mapType)
    {
        if (typeof mapType === 'undefined') {
            mapType = jbdUtils.getProperty('mapType');
        }

        mapType = parseInt(mapType);

        let mapClass;
        switch (mapType) {
            case JBDConstants.MAP_TYPE_GOOGLE:
                mapClass = JBDGoogleMap;
                break;
            case JBDConstants.MAP_TYPE_BING:
                mapClass = JBDBingMap;
                break;
            case JBDConstants.MAP_TYPE_OSM:
                mapClass = JBDOpenMap;
                break;

            default:
                mapClass = JBDGoogleMap;
        }

        return mapClass;
    }

    /**
     * Open modal with GDPR details
     *
     * @param locations array locations with their lat and lang for each of them
     * @param params array params with settings
     * @param mapType int map type
     */
    static openMapGDPRModal(locations, params, mapType)
    {
        let modal = jQuery('#map-gdpr-modal');
        modal.jbdModal();
        modal.on('hidden.bs.modal', function () {
            return false;
        });

        jQuery('#gdpr-deny-btn').on('click', (event) => {
            jQuery.jbdModal.close();
            return false;
        });

        jQuery('#gdpr-accept-btn').on('click', (event) => {
            JBDMapHelper.acceptMapGDPR(locations, params, mapType);
        });
    }

    /**
     * Accept map GPDPR rules and update them with ajax
     *
     * @param locations array locations with their lat and lang for each of them
     * @param params array params with settings
     * @param mapType int map type
     */
    static acceptMapGDPR(locations, params, mapType)
    {
        let urlAcceptMapGdpr = jbdUtils.getAjaxUrl('acceptMapGDPRAjax', 'companies');
        jQuery.ajax({
            type:"GET",
            url: urlAcceptMapGdpr,
            dataType: 'json',
            success: () => {
                jbd_map_gdpr = true;
                jQuery.jbdModal.close();

                JBDMapHelper.loadMapScript(locations, params, mapType);
            }
        });
    }

    /**
     * Initiate map autocomplete so when locations are searched on input field suggestions will be shown
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     * @param componentForm string component form name
     */
    static initAutocomplete(element, action, preventSubmit, focus_view, limitedCountries, componentForm)
    {
        let mapClass = JBDMapHelper.getMapClass();

        mapClass.initAutocomplete(element, action, preventSubmit, focus_view, limitedCountries, componentForm);
    }

    /**
     * Reserve Geocoding
     *
     * @param location
     * @param action
     * @returns {boolean}
     */
    static reverseGeocoding(location, action)
    {
        if (jbdUtils.getProperty('mapType') == JBDConstants.MAP_TYPE_BING) {
            return false;
        }

        let mapClass = JBDMapHelper.getMapClass();

        mapClass.reverseGeocoding(location, action);
    }

    /**
     * Return map instance based on the map ID
     *
     * @param mapId int map ID
     * @returns {null}
     */
    static getMapInstance(mapId)
    {
        let mapInstance = null;
        if (typeof JBDMapHelper.map_instances !== 'undefined') {
            if (typeof JBDMapHelper.map_instances[mapId] !== 'undefined') {
                mapInstance = JBDMapHelper.map_instances[mapId];
            }
        }

        return mapInstance;
    }
};/**
 * JBD Bing map class
 */
class JBDBingMap extends JBDMapAbstract
{

    /**
     * Class constructor
     *
     * @param locations array with location to put on map
     * @param params array options of the map
     * @param mapType int map type
     */
    constructor(locations, params, mapType)
    {
    	super(locations, params, mapType);

    	this.bounds = {
	        "maxLat": -999,
	        "minLng": 999,
	        "minLat": 999,
	        "maxLng": -999
	    };

        if (typeof this.params !== 'undefined' && this.params != null) {
            if (typeof this.params['key'] !== 'undefined') {
                this.key = this.params['key'];
            }
        }
    }

    /**
     * Checks if map is loaded and if it is not then initialize it
     */
    checkifMapLoaded() {
		var flag = false;
				
		if (typeof(Microsoft.Maps.Location) === "function" && typeof(Microsoft.Maps.Location.prototype) === "object") {
			flag = true;
		}
		
		if(flag == false) {
		   window.setTimeout(this.checkifMapLoaded.bind(this), 500); /* this checks the flag every 100 milliseconds*/
		}else{
			console.debug("Microsoft.Maps.Location exists");
			this.initializeMap();
		} 
	}

    /**
     * Used to call checkifMapLoaded function
     */
    initialize(){
		this.checkifMapLoaded();
    }

    /**
     * Initialize Map class,add the event listener's and set the markers and display it
     */
    initializeMap()
    {
        if (this.params != null && typeof this.params['no_map'] === 'undefined') {
            var mapdiv = document.getElementById(this.mapDiv);
            mapdiv.style.width = this.mapWidth;
            mapdiv.style.height = this.mapHeight;

            this.map = new Microsoft.Maps.Map('#' + this.mapDiv, {
                credentials: this.key,
                center: new Microsoft.Maps.Location(this.params['map_latitude'], this.params['map_longitude']),
                mapTypeId: Microsoft.Maps.MapTypeId.ROAD,
                zoom: this.zoom
            });

            if (this.eventParams != null) {
                this.addMapListener(this.eventParams.event, this.eventParams.action);
            }

            if(this.locations.length>0){
            	this.setMarkers();
        	}
            
            var self = this;
            if (this.params["map_clustering"] == 1) {
                Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
                    var clusterLayer = new Microsoft.Maps.ClusterLayer(self.markers);
                    self.map.layers.insert(clusterLayer);
                });
            }

            if (this.params['autolocate'] == 1) {
                if (this.bounds.maxLat > -999) {
                    var box = new Microsoft.Maps.LocationRect.fromEdges(
                        this.bounds.maxLat,
                        this.bounds.minLng,
                        this.bounds.minLat,
                        this.bounds.maxLng
                    );

                    if (box.height != 0) {
                        this.map.setView({
                            bounds: box,
                            zoom: this.map.getZoom()
                        });
                    }
                }
            }
        }
    }

    /**
     * Set map markers on the map and associate related options and attributes
     */
    setMarkers()
    {
        var self = this;

        var lastMarker = null;
        for (var i = 0; i < this.locations.length; i++) {
            var item = this.locations[i];

            //skip iteration if not defined
            if (item.length == 0 || item === 'undefined') {
                continue;
            }

            var marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(item['latitude'], item['longitude']), 54);

            this.bounds.maxLat = this.bounds.maxLat <  parseFloat(item['latitude']) ?  parseFloat(item['latitude']) : this.bounds.maxLat;
            this.bounds.minLat = this.bounds.minLat >  parseFloat(item['latitude']) ?  parseFloat(item['latitude']) : this.bounds.minLat;
            this.bounds.maxLng = this.bounds.maxLng <  parseFloat(item['longitude']) ?  parseFloat(item['longitude']) : this.bounds.maxLng;
            this.bounds.minLng = this.bounds.minLng >  parseFloat(item['longitude']) ?  parseFloat(item['longitude']) : this.bounds.minLng;

            let markerImage = '';
            if (this.params["map_clustering"] != 1) {
                if (item.marker != '0') {
                    markerImage = item.marker;
                } else if (jbdUtils.getProperty('mapMarker') && jbdUtils.getProperty('mapMarker').length) {
                    markerImage = jbdUtils.getProperty('imageBaseUrl') + jbdUtils.getProperty('mapMarker');
                }
            }

            if (markerImage !== "") {
                marker.setOptions({
                    icon: markerImage
                });
            }

            var center = this.map.getCenter();
            this.infobox = new Microsoft.Maps.Infobox(center, {
                maxWidth: 263,
                maxHeight: 645,
                visible: false
            });

            marker.metadata = {
                description: 'description'
            };
            marker.metadata.description = item.content;

            var zIndex = 0;
            if (typeof item['zIndex'] !== 'undefined') {
                zIndex = item['zIndex'];
            }
            marker.metadata.zIndex = zIndex;

            var markerFunction  = function (e) {
                if (e.target.metadata.description.length > 0) {
                    self.infobox.setOptions({
                        location: e.target.getLocation(),
                        description: e.target.metadata.description,
                        visible: true
                    });
                }

                self.moveToLocation(e.target.getLocation());
            };

            if (this.params["isLayout"] == 1) {
                markerFunction  = function (e) {
                    var target = "#company" + e.target.metadata.zIndex;
                    window.location = target;

                    jQuery(target).fadeOut(1, function () {
                        jQuery(target).css("background-color", "#469021").fadeIn(500);
                    });

                    setTimeout(function () {
                        jQuery(target).removeClass('selected-company');
                        jQuery(target).fadeOut(1, function () {
                            jQuery(target).css("background-color", "transparent").fadeIn(700);
                        });
                    }, 1200);
                };
            }

            Microsoft.Maps.Events.addHandler(marker, 'mousedown', markerFunction);
            this.infobox.setMap(this.map);
            
            if(this.markers !== undefined){
            	this.markers.push(marker);
            }else{
            	this.markers = Array(marker);
            }

            if (this.params["map_clustering"] != 1) {
                this.map.entities.push(marker);
            }

            if (typeof item['in_range'] !== 'undefined') {
                lastMarker = marker;
            }
        }

        if (this.params["has_location"] == 1 && this.params['longitude'] != '') {
            var myLatLng = {
                latitude: this.params["latitude"],
                longitude: this.params["longitude"]
            };

            this.addMarker(myLatLng);

            lastMarker = this.markers.pop();
            lastMarker.setOptions({
                icon: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png'
            });
        }

        if (this.params["radius"] > 0) {
            if (typeof this.params['longitude'] == 'undefined' && typeof this.params['latitude'] == 'undefined' || this.params['longitude'] == '') {
                this.params['longitude'] = this.params['map_longitude'];
                this.params['latitude'] = this.params['map_latitude'];
            }

            Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', function () {
                if (typeof self.params['map_longitude'] !== 'undefined' && typeof self.params['map_latitude'] !== 'undefined') {
                    if (self.params['has_location'] == 1 || lastMarker != null) {
                        var center = lastMarker.getLocation();

                        var circle = new Microsoft.Maps.Polygon(center, center, center);
                        circle.metadata = {
                            center: center
                        };

                        self.setCircle(center, circle, self.params["radius"]);
                    }
                }
            });
        }
    }

    /**
     * Add a circle on the map
     *
     * @param center array with lat and lang
     * @param circle circle with the radius set
     * @param radius radius from the center
     */
    setCircle(center, circle, radius)
    {
        //Calculate circle locations.
        var locs = Microsoft.Maps.SpatialMath.getRegularPolygon(circle.metadata.center, radius, 36, Microsoft.Maps.SpatialMath.DistanceUnits.Miles);

        //Update the circles location.
        circle.setLocations(locs);
        this.map.entities.push(circle);
    }

    /**
     * Move to location when setting markers
     *
     * @param location array with location settings
     */
    moveToLocation(location)
    {
        this.map.setView({
            center: new Microsoft.Maps.Location(location.latitude, location.longitude)
        });
    }

    /**
     * Add marker on map and associate the callback with it
     * @param location array location lat and lang
     * @param callback callback function
     */
    addMarker(location, callback)
    {
        var marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(location.latitude, location.longitude));
        this.map.entities.push(marker);
        this.markers.push(marker);

        if (typeof callback !== 'undefined') {
            callback();
        }
    }

    /**
     * Remove map markers
     */
    clearMarkers()
    {
        for (var i = this.map.entities.getLength() - 1; i >= 0; i--) {
            var pushpin = this.map.entities.get(i);
            if (pushpin instanceof Microsoft.Maps.Pushpin) {
                this.map.entities.removeAt(i);
            }
        }

        this.markers = [];
    }

    /**
     * Add map listener
     *
     * @param event string event type to associate with the event
     * @param action function to call
     */
    addMapListener(event, action)
    {
        Microsoft.Maps.Events.addHandler(this.map, event, function (e) {
            if (e.targetType === "map") {
                var point = new Microsoft.Maps.Point(e.getX(), e.getY());
                var location = e.target.tryPixelToLocation(point);
                action(location);
            }
        });

        this.eventParams = null;
    }

    /**
     * Trigger the autocomplete so when locations are searched on input field suggestions will be shown
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     */
    static triggerAutocomplete(element, action, preventSubmit, focus_view, limitedCountries) {
		var flag = false;
		
		if (typeof(Microsoft.Maps.Location) === "function" && typeof(Microsoft.Maps.Location.prototype) === "object"
			&& typeof(Microsoft.Maps.loadModule) === "function" && typeof(Microsoft.Maps.loadModule.prototype) === "object") {
			flag = true;
		}
		
		if (flag == false) {
		   window.setTimeout(this.triggerAutocomplete.bind(this,element, action, preventSubmit, focus_view, limitedCountries), 500); /* this checks the flag every 100 milliseconds*/
		} else {
			console.debug("Microsoft.Maps.loadModule exists");
			JBDBingMap.loadInitAutocomplete(element, action, preventSubmit, focus_view, limitedCountries);
		} 
	}

    /**
     * Initiate map autocomplete so when locations are searched on input field suggestions will be shown
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     */
    static initAutocomplete(element, action, preventSubmit, focus_view, limitedCountries){
		JBDBingMap.triggerAutocomplete(element, action, preventSubmit, focus_view, limitedCountries);
    }

    /**
     * Load locations that are searched on input field suggestions
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     */
    static loadInitAutocomplete(element, action, preventSubmit, focus_view, limitedCountries)
    {
		/*console.debug("loadInitAutocomplete");
		console.debug(element);
		console.debug(action);
		console.debug(preventSubmit);
		console.debug(focus_view);
*/		
        if (typeof focus_view === 'undefined') {
            focus_view = false;
        }
        
        Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', function () {
            var options = {
                maxResults: 5
            };

            var elementId = jQuery(element).attr('id');
            var parentId = jQuery(element).parent().attr('id');
            var manager = new Microsoft.Maps.AutosuggestManager(options);

            if (typeof mapInstance === 'undefined' && typeof jbdAdminMapInstance === 'undefined') {
                jQuery('#'+parentId).append('<div style="display:none" id="bing-fake-autocomplete"></div>');  
                let map = new Microsoft.Maps.Map(document.getElementById('bing-fake-autocomplete'));
            }

            manager.attachAutosuggest('#' + elementId, '#' + parentId, function (result) {
                if (focus_view) {
                    if (typeof jbdAdminMapInstance !== 'undefined') {
                        jbdAdminMapInstance.autocompleteFocus(result);
                    }
                }

                action(JBDBingMap.formatSuggestionResponse(result));
                jQuery('#as_container').css('visibility', 'hidden');
            });
        });
    }

    /**
     * Add marker for the location search and focus map on it
     *
     * @param result object map location
     */
    autocompleteFocus(result)
    {
        this.clearMarkers();
        this.addMarker(result.location);
        this.map.setView({bounds: result.bestView});
    }

    /**
     * Response handle for the function loadInitAutocomplete
     * @param place object response
     * @returns {[]}
     */
    static formatSuggestionResponse(place)
    {
        var suggestionResult = [];

        suggestionResult["country"] = place.address.countryRegion;
        suggestionResult["locality"] = place.address.locality;
        suggestionResult["route"] = place.address.addressLine;
        suggestionResult["administrative_area_level_1"] = place.address.adminDistrict;
        suggestionResult["administrative_area_level_2"] = place.address.district;
        suggestionResult["postal_code"] = place.address.postalCode;
        suggestionResult["latitude"] = place.location.latitude;
        suggestionResult["longitude"] = place.location.longitude;

        return suggestionResult;
    }
};/**
 * JBD Google map class
 */
class JBDGoogleMap extends JBDMapAbstract{

    /**
     * Class constructor
     *
     * @param locations array with location to put on map
     * @param params array options of the map
     * @param mapType int map type
     */
    constructor(locations, params, mapType){
      
    	super(locations, params, mapType);
    }

    /**
     * Initialize Map class,add the event listener's and set the markers and display it
     */
    initialize()
    {
        if (this.params != null &&  typeof this.params['no_map'] === 'undefined') {
            var center = 0;
            if (typeof this.params['map_longitude'] !== 'undefined' && typeof this.params['map_latitude'] !== 'undefined') {
                center = new google.maps.LatLng(this.params['map_latitude'], this.params['map_longitude']);
            }

            var search_styles = [
            	  {
            		    "featureType": "administrative",
            		    "elementType": "geometry",
            		    "stylers": [
            		      {
            		        "visibility": "off"
            		      }
            		    ]
            		  },
            		  {
            		    "featureType": "poi",
            		    "stylers": [
            		      {
            		        "visibility": "off"
            		      }
            		    ]
            		  },
            		  {
            		    "featureType": "road",
            		    "elementType": "labels.icon",
            		    "stylers": [
            		      {
            		        "visibility": "off"
            		      }
            		    ]
            		  },
            		  {
            		    "featureType": "transit",
            		    "stylers": [
            		      {
            		        "visibility": "off"
            		      }
            		    ]
            		  }
            		];

            var mapOptions = {
                zoom: this.zoom,
                scrollwheel: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: center
            };
            
            mapOptions.styles = search_styles;

            var mapdiv = document.getElementById(this.mapDiv);
            mapdiv.style.width = this.mapWidth;
            mapdiv.style.height = this.mapHeight;

            this.map = new google.maps.Map(mapdiv, mapOptions);

            if(this.locations.length>0){
            	this.setMarkers();
        	}

            if (this.params['panorama'] == 1 && this.locations.length>0) {
                var company = this.locations[0];
                var myLatLng = new google.maps.LatLng(company.latitude, company.longitude);

                this.panorama = this.map.getStreetView();
                this.panorama.setPosition(myLatLng);
                this.panorama.setPov(/** @type {google.maps.StreetViewPov} */({
                    heading: 265,
                    pitch: 0
                }));
            }
        }
    }

    /**
     * Set map markers on the map and associate related options and attributes
     */
    setMarkers()
    {
        // Add markers to the map

        // Marker sizes are expressed as a Size of X,Y
        // where the origin of the image (0,0) is located
        // in the top left of the image.

        // Origins, anchor positions and coordinates of the marker
        // increase in the X direction to the right and in
        // the Y direction down.

        var bounds = new google.maps.LatLngBounds();
        var markers = [];
        var self = this;

        var lastMarker = null;
        for (var i = 0; i < this.locations.length; i++) {
            var item = this.locations[i];

            //skip iteration if not defined
            if (item.length == 0 || item === 'undefined') {
                continue;
            }

            var pinImage = null;

            var markerHeight = 32;
            var markerWidth  = 32;

            var anchor_left = markerWidth / 2;
            var anchor_top  = markerHeight;

            let width = 32;
            let height = 37;
            
            let markerSize = jbdUtils.getProperty('marker_size');
            if (markerSize.length != 0) {
                width = markerSize.width;
                height = markerSize.height;
            }

            if (typeof item['marker'] !== 'undefined' && item['marker'] != '0') {
                pinImage = {
                    url: item['marker'],
                    scaledSize: new google.maps.Size(width, height),
                    origin: new google.maps.Point(0,0),
                    anchor: new google.maps.Point(anchor_left, anchor_top)
                };
            } 
            else if (jbdUtils.getProperty('mapMarker') && jbdUtils.getProperty('mapMarker').length) {
                pinImage = {
                    url: jbdUtils.getProperty('imageBaseUrl') + jbdUtils.getProperty('mapMarker'),
                    scaledSize: new google.maps.Size(width, height),
                    origin: new google.maps.Point(0,0),
                    anchor: new google.maps.Point(anchor_left, anchor_top)
                }; 
            }

            var myLatLng = new google.maps.LatLng(item['latitude'], item['longitude']);

            //Check Markers array for duplicate position and offset a little
            if (markers.length != 0 && false) {
                for (i = 0; i < markers.length; i++) {
                    var existingMarker = markers[i];
                    var pos = existingMarker.getPosition();
                    var distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLng, pos);
                    if (distance < 50 && false) {
                        var a = 360.0 / markers.length;
                        var newLat = pos.lat() + -.00004 * Math.cos((+a * i) / 180 * Math.PI);  //x
                        var newLng = pos.lng() + -.00004 * Math.sin((+a * i) / 180 * Math.PI);  //Y
                        myLatLng = new google.maps.LatLng(newLat, newLng);
                    }
                }
            }

            var zIndex = 0;
            if (typeof item['zIndex'] !== 'undefined') {
                zIndex = item['zIndex'];
            }

            var marker = new google.maps.Marker({
                position: myLatLng,
                map: this.map,
                icon: pinImage,
                animation: google.maps.Animation.DROP,
                title: item['title'],
                zIndex: zIndex
            });

            if (typeof item['in_range'] !== 'undefined') {
                lastMarker = marker;
            }

            markers.push(marker);
            if(this.markers !== undefined){
            	this.markers.push(marker);
            }else{
            	this.markers = Array(marker);
            }
            
            if (this.params["isLayout"] == 1) {
                (function (Marker) {
                    google.maps.event.addListener(marker, 'click', function () {
                        var target = "#company" + this.getZIndex();
                        window.location = target;

                        jQuery(target).fadeOut(1, function () {
                            jQuery(target).css("background-color", "#469021").fadeIn(500);
                        });

                        setTimeout(function () {
                            jQuery(target).removeClass('selected-company');
                            jQuery(target).fadeOut(1, function () {
                                jQuery(target).css("background-color", "transparent").fadeIn(700);
                            });
                        }, 1200);
                    });
                }(marker));
            } else {
                var contentBody = item['content'];
                var infowindow = new google.maps.InfoWindow({
                    content: contentBody,
                    maxWidth: 210
                });

                google.maps.event.addListener(marker, 'click', function (contentBody) {
                    return function () {
                        infowindow.setContent(contentBody);
                        infowindow.open(this.map, this);
                    }
                }(contentBody));
            }

            bounds.extend(myLatLng);
        }

        if (this.params["isLayout"] == 1) {
            jQuery(".btn-show-marker").click(function () {
                var companyID = jQuery(this).closest('.grid-item-holder').attr('id');
                var id = companyID.match(/\d/g);
                id = id.join('');

                for (i = 0; i < markers.length; i++) {
                    if (markers[i].getZIndex() == id) {
                        self.map.setZoom(16);
                        self.map.setCenter(markers[i].getPosition());
                    }
                }
            });
        }

        if (this.params["map_clustering"] == 1) {
            let mcOptions = {
                imagePath: this.params['imagePath'] + "mapcluster/m"
            };
            var markerCluster = new MarkerClusterer(this.map, markers, mcOptions);
        }

        if (this.params["has_location"] == 1 && this.params['longitude'] != '') {
            var pinImage = new google.maps.MarkerImage("https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
                new google.maps.Size(31, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34)
            );

            myLatLng = new google.maps.LatLng(this.params["latitude"], this.params["longitude"]);
            marker = new google.maps.Marker({
                position: myLatLng,
                map: this.map,
                icon: pinImage
            });

            lastMarker = marker;
        }

        if (this.params["radius"] > 0) {
            // Add circle overlay and bind to marker

            if (typeof this.params['longitude'] == 'undefined' && typeof this.params['latitude'] == 'undefined' || this.params['longitude'] == '') {
                this.params['longitude'] = this.params['map_longitude'];
                this.params['latitude'] = this.params['map_latitude'];
            }

            if (typeof this.params['longitude'] !== 'undefined' && typeof this.params['latitude'] !== 'undefined' && this.params['longitude'] !== '') {
                this.map.setCenter(new google.maps.LatLng(this.params['latitude'], this.params['longitude']));
                var circle = new google.maps.Circle({
                    map: this.map,
                    radius: this.params['radius'] * 1600,
                    strokeColor: "#006CD9",
                    strokeOpacity: 0.7,
                    strokeWeight: 2,
                    fillColor: "#006CD9",
                    fillOpacity: 0.15
                });

                if (this.params["has_location"] == 1 || lastMarker != null) {
                    circle.bindTo('center', lastMarker, 'position');
                }
            }
        }

        bounds.extend(myLatLng);
        if (this.params['autolocate'] == 1) {
            this.map.fitBounds(bounds);
        }

        var listener = google.maps.event.addListener(this.map, "idle", function () {
            if (self.map.getZoom() > 16) self.map.setZoom(16);
            google.maps.event.removeListener(listener);
        });
    }

    /**
     * Add toggle animation for the markers when added on map
     *
     * @param marker object map marker
     */
    toggleBounce(marker)
    {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    /**
     * Add toggle street view for the location on map
     */
    toggleStreetView()
    {
        var toggle = this.panorama.getVisible();
        if (toggle == false) {
            this.panorama.setVisible(true);
        } else {
            this.panorama.setVisible(false);
        }
    }

    /**
     * Move to location when setting markers
     *
     * @param location array with location settings
     */
    moveToLocation(location)
    {
        var center = new google.maps.LatLng(location.latitude, location.longitude);
        this.map.panTo(center);
    }

    /**
     * Add marker on map and associate the callback with it
     * @param location array location lat and lang
     * @param callback callback function
     */
    addMarker(location, callback)
    {
        var loc = new google.maps.LatLng(location.latitude, location.longitude);
        var marker = new google.maps.Marker({
            position: loc,
            map: this.map
        });
        this.markers.push(marker);

        if (typeof callback !== 'undefined') {
            callback();
        }
    }

    /**
     * Remove map markers
     */
    clearMarkers()
    {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
    }

    /**
     * Add map listener
     *
     * @param event string event type to associate with the event
     * @param action function to call
     */
    addMapListener(event, action)
    {
        google.maps.event.addListener(this.map, event, function (e) {
            var location = {};
            location.latitude = e.latLng.lat();
            location.longitude = e.latLng.lng();
            action(location);
        });
    };

    /**
     * Initiate map autocomplete so when locations are searched on input field suggestions will be shown
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     * @param componentForm string component form name
     */
    static initAutocomplete(element, action, preventSubmit, focus_view, limitedCountries, componentForm)
    {
        var self = this;
        var place;
        var autocomplete;

        if (typeof limitedCountries !== 'undefined' && limitedCountries !== null) {
            autocomplete = new google.maps.places.Autocomplete(element, {
                types: ['geocode'],
                componentRestrictions: {
                    country: limitedCountries
                }
            });
        } else {
            autocomplete = new google.maps.places.Autocomplete(element, {
                types: ['geocode']
            });
        }

        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            place = autocomplete.getPlace();
            action(JBDGoogleMap.formatSuggestionResponse(place, componentForm));

            if (focus_view) {
                if (typeof jbdAdminMapInstance !== 'undefined') {
                    jbdAdminMapInstance.autocompleteFocus(place);
                }
            }
        });

        if (preventSubmit) {
            google.maps.event.addDomListener(element, 'keydown', function (e) {
                if (e.keyCode == 13 && jQuery('.pac-container:visible').length) {
                    e.preventDefault();
                }
            });
        }
    }

    /**
     * Add marker for the location search and focus map on it
     *
     * @param place object map location
     */
    autocompleteFocus(place)
    {
        this.map.setCenter(place.geometry.location);

        if (place.geometry.viewport) {
            this.map.fitBounds(place.geometry.viewport);
        }

        let loc = {};
        loc.latitude = place.geometry.location.lat();
        loc.longitude = place.geometry.location.lng();

        this.clearMarkers();
        this.addMarker(loc);
    }

    /**
     * Reserve Geocoding
     *
     * @param location
     * @param action
     * @returns {boolean}
     */
    static reverseGeocoding(location, action)
    {
        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(location.latitude, location.longitude);
        var country;

        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    //find country
                    for (var i=0; i<results[0].address_components.length; i++) {
                        for (var b=0;b<results[0].address_components[i].types.length;b++) {
                            if (results[0].address_components[i].types[b] === "country") {
                                //get the country data
                                country = results[0].address_components[i];
                                break;
                            }
                        }
                    }
                    //set country code
                    action(country.short_name);
                }
            }
        });
    }

    /**
     * Response handle for the function loadInitAutocomplete
     * @param place object response
     * @param component_form string component form name
     * @returns {[]}
     */
    static formatSuggestionResponse(place, component_form)
    {
        var suggestionResult = [];

        if (typeof component_form !== 'undefined') {
            for (var j = 0; j < place.address_components.length; j++) {
                var att = place.address_components[j].types[0];

                suggestionResult[att] = place.address_components[j][component_form[att]];
            }
        }

        if (typeof suggestionResult['locality'] === 'undefined') {
            suggestionResult['locality'] = suggestionResult['administrative_area_level_1'];

            if (place.address_components[1].types[0] == "postal_town") {
                suggestionResult['locality'] = place.address_components[1]["long_name"];
            }

        }

        suggestionResult['latitude']  = place.geometry.location.lat();
        suggestionResult['longitude'] = place.geometry.location.lng();

        return suggestionResult;
    }
};/**
 * JBD Open Map javascript class
 */
class JBDOpenMap extends JBDMapAbstract
{
    /**
     * Class constructor
     *
     * @param locations array with location to put on map
     * @param params array options of the map
     * @param mapType int map type
     */
    constructor(locations, params, mapType)
    {
        super(locations, params, mapType);

    	this.infoboxTemplate = "<div style='overflow:hidden;'>{content}</div>";
    	this.bounds = {
	        "maxLat": -999,
	        "minLng": 999,
	        "minLat": 999,
	        "maxLng": -999
	    };
    }

    /**
     * Initialize Map class,add the event listener's and set the markers and display it
     */
    initialize()
    {
        if (this.params != null && typeof this.params['no_map'] === 'undefined') {
            var parent = jQuery('#' + this.mapDiv).parent();
            jQuery('#' + this.mapDiv).remove();
            parent.append
            (
                '<div id="' + this.mapDiv + '" ' +
                'style="width:' + this.mapWidth + ';height:' + this.mapHeight + ';z-index:1">' +
                '</div>'
            );

            this.map = L.map(this.mapDiv, {
                dragging: !L.Browser.mobile
            }).setView(
                [this.params['map_latitude'], this.params['map_longitude']],
                this.zoom
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            
            this.setMarkers();
        	
            
            this.map.invalidateSize(false);

            if (this.params['autolocate'] == 1) {
                this.map.fitBounds([
                    [this.bounds.maxLat, this.bounds.maxLng],
                    [this.bounds.minLat, this.bounds.minLng]
                ]);
            }
        }
    }

    /**
     * Set map markers on the map and associate related options and attributes
     */
    setMarkers()
    {
        var markerClusters;
        if (this.params["map_clustering"] == 1) {
            markerClusters = L.markerClusterGroup();
        }

        var lastMarker = null;
        
        if(this.locations.length>0){
	        for (var i = 0; i < this.locations.length; i++) {
	            var item = this.locations[i];
	
	            //skip iteration if not defined
	            if (item.length == 0 || item === 'undefined') {
	                continue;
	            }
	
	            this.bounds.maxLat = this.bounds.maxLat < parseFloat(item['latitude']) ? parseFloat(item['latitude']) : this.bounds.maxLat;
	            this.bounds.minLat = this.bounds.minLat > parseFloat(item['latitude']) ? parseFloat(item['latitude']) : this.bounds.minLat;
	            this.bounds.maxLng = this.bounds.maxLng < parseFloat(item['longitude']) ? parseFloat(item['longitude']) : this.bounds.maxLng;
	            this.bounds.minLng = this.bounds.minLng > parseFloat(item['longitude']) ? parseFloat(item['longitude']) : this.bounds.minLng;
	
	            var markerImage;
	            if (this.params["map_clustering"] != 1) {
	                if (item.marker != '0') {
	                    markerImage = item.marker;
	                } else if (jbdUtils.getProperty('mapMarker') && jbdUtils.getProperty('mapMarker').length) {
	                    markerImage = jbdUtils.getProperty('imageBaseUrl') + jbdUtils.getProperty('mapMarker');
	                }
	            }
	
	            var zIndex = 0;
	            if (typeof item['zIndex'] !== 'undefined') {
	                zIndex = item['zIndex'];
	            }
	
	            var popup = this.infoboxTemplate.replace('{content}', item['content']);
	            var marker = L.marker([item['latitude'], item['longitude']]);
	
	            marker.zIndex = zIndex;
	            if (this.params['isLayout'] != 1) {
	                marker.bindPopup(popup);
	            } else {
	                var markersLayer = L.featureGroup().addTo(this.map);
	
	                markersLayer.on("click", function (event) {
	                    var clickedMarker = event.layer;
	                    var target = "#company" + clickedMarker.zIndex;
	                    window.location = target;
	
	                    jQuery(target).fadeOut(1, function () {
	                        jQuery(target).css("background-color", "#469021").fadeIn(500);
	                    });
	
	                    setTimeout(function () {
	                        jQuery(target).removeClass('selected-company');
	                        jQuery(target).fadeOut(1, function () {
	                            jQuery(target).css("background-color", "transparent").fadeIn(700);
	                        });
	                    }, 1200);
	                });
	
	                marker.addTo(markersLayer);
	
	                var self = this;
	                jQuery(".btn-show-marker").click(function () {
	                    var companyID = jQuery(this).closest('.grid-item-holder').attr('id');
	                    var id = companyID.match(/\d/g);
	                    id = id.join('');
	
	                    for (var i = 0; i < self.markers.length; i++) {
	                        if (self.markers[i].zIndex == id) {
	                            self.map.setView(
	                                [self.markers[i].getLatLng().lat, self.markers[i].getLatLng().lng],
	                                16
	                            );
	                        }
	                    }
	                });
	            }
	
	            if (this.params["map_clustering"] != 1) {
	                marker.addTo(this.map);
	            }
	
	            if (markerImage !== "" && typeof markerImage !== 'undefined') {
	                let iconSize = [32,32];
	
	                let markerSize = jbdUtils.getProperty('marker_size');
	                if (markerSize.length != 0) {
	                    iconSize = [markerSize.width, markerSize.height];
	                }
	
	                var icon = L.icon({
	                    iconUrl: markerImage,
	                    iconSize: iconSize,
	                });
	
	                marker.setIcon(icon);
	            }
	            markerImage = '';
	
	
	            if (this.params["map_clustering"] == 1) {
	                markerClusters.addLayer(marker);
	            }
	
	            if(this.markers !== undefined){
	            	this.markers.push(marker);
	            }else{
	            	this.markers = Array(marker);
	            }
	
	
	            if (typeof item['in_range'] !== 'undefined') {
	                lastMarker = marker;
	            }
	        }
	
	        if (this.params["map_clustering"] == 1) {
	            this.map.addLayer(markerClusters);
	        }
        }
        
        if (this.params["has_location"] == 1) {
            var myLatLng = {
                latitude: this.params["latitude"],
                longitude: this.params["longitude"]
            };

            this.addMarker(myLatLng);

            lastMarker = this.markers.pop();
            var tmpIcon = L.icon({
                iconUrl: 'https://maps.google.com/mapfiles/kml/shapes/library_maps.png'
            });
            lastMarker.setIcon(tmpIcon);
        }

        if (this.params["radius"] > 0) {
            if (typeof this.params['longitude'] == 'undefined' && typeof this.params['latitude'] == 'undefined' || this.params['longitude'] == '') {
                this.params['longitude'] = this.params['map_longitude'];
                this.params['latitude'] = this.params['map_latitude'];
            }

            if (this.params['has_location'] == 1 || lastMarker != null) {
                var center = lastMarker.getLatLng();
                L.circle([center.lat, center.lng], this.params["radius"] * 1600).addTo(this.map);
            }
        }
    }

    /**
     * Move to location when setting markers
     *
     * @param location array with location settings
     */
    moveToLocation(location)
    {
        this.map.setView([location.latitude, location.longitude]);
    }

    /**
     * Add marker on map and associate the callback with it
     * @param location array location lat and lang
     * @param callback callback function
     */
    addMarker(location, callback)
    {
        var marker = L.marker([location.latitude, location.longitude]).addTo(this.map);
        
        if(this.markers !== undefined){
        	this.markers.push(marker);
        }else{
        	this.markers = Array(marker);
        }

        if (typeof callback !== 'undefined') {
            callback();
        }
    }

    /**
     * Remove map markers
     */
    clearMarkers()
    {
        for (var i = 0; i < this.markers.length; i++) {
            this.map.removeLayer(this.markers[i]);
        }
    }

    /**
     * Add map listener
     *
     * @param event string event type to associate with the event
     * @param action function to call
     */
    addMapListener(event, action)
    {
        this.map.on(event, function (e) {
            var location = {};
            location.latitude = e.latlng.lat;
            location.longitude = e.latlng.lng;
            action(location);
        });
    }

    /**
     * Initiate map autocomplete so when locations are searched on input field suggestions will be shown
     *
     * @param element object javascript object of input field
     * @param action function called
     * @param preventSubmit bool prevent submit form
     * @param focus_view
     * @param limitedCountries array with only the countries that are allowed to search on
     */
    static initAutocomplete(element, action, preventSubmit, focus_view, limitedCountries)
    {
        var self = this;

        if (limitedCountries == null){
            limitedCountries = [];
        }

        jQuery(element).keyup(function (e) {
            var key = event.keyCode || event.charCode;
            if(key == 38 || key ==40){
                return;
            }
            var query = jQuery(element).val();
            var countyLimit = '';
            if (limitedCountries.length > 0) {
                countyLimit = '&countrycodes='+limitedCountries.join();
            }
            var url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q="+query+countyLimit;
            var res;

            jQuery(element).autocomplete({
                source: function (request, response) {
                    jQuery.ajax({
                        type: "GET",
                        url: url,
                        dataType: 'json',
                        success: function (data) {
                            response(jQuery.map(data, function (item) {
                                return {
                                    label: item.display_name,
                                    value: item.place_id
                                };
                            }));

                            res = data;
                        }
                    });
                },
                select: function (event, ui) {
                    event.preventDefault();
                    jQuery(element).val(ui.item.label);
                    for (var i in res) {
                        if (res.hasOwnProperty(i)) {
                            if (res[i].place_id == ui.item.value) {
                                if (focus_view) {
                                    if (typeof jbdAdminMapInstance !== 'undefined') {
                                        jbdAdminMapInstance.autocompleteFocus(res[i].lat, res[i].lon);
                                    }
                                }
                                action(JBDOpenMap.formatSuggestionResponse(res[i]));
                            }
                        }
                    }
                }
            });
        });
    }

    /**
     * Add marker for the location search and focus map on it
     *
     * @param lat string map latitude location
     * @param long string map longitude location
     */
    autocompleteFocus(lat, long)
    {
        this.clearMarkers();
        let loc = {};
        loc.latitude = lat;
        loc.longitude = long;
        this.addMarker(loc);
        this.moveToLocation(loc);
    }

    /**
     * Reserve Geocoding
     *
     * @param location
     * @param action
     * @returns {boolean}
     */
    static reverseGeocoding(location, action)
    {
        let lon = location.longitude;
        let lat = location.latitude;
        let response;

        let url = "https://nominatim.openstreetmap.org/reverse.php?format=json&lat=" + lat + "&lon=" + lon;

        jQuery.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            success: (data) => {
                response = JBDOpenMap.formatSuggestionResponse(data);

                action(response.country_code);
            }
        });
    }

    /**
     * Response handle for the function loadInitAutocomplete
     * @param place object response
     * @param component_form string component form name
     * @returns {[]}
     */
    static formatSuggestionResponse(place)
    {
        let suggestionResult = [];

        let locality = '';
        if (typeof place.address.city !== 'undefined') {
            locality = place.address.city;
        } else if (typeof place.address.town !== 'undefined') {
            locality = place.address.town;
        }

        let street_number = '';
        if (typeof place.address.street_number !== 'undefined') {
            street_number = place.address.street_number;
        } else if (typeof place.address.house_number !== 'undefined') {
            street_number = place.address.house_number;
        }

        let street = '';
        if (typeof place.address.street !== 'undefined') {
            street = place.address.street;
        } else if (typeof place.address.road !== 'undefined') {
            street = place.address.road;
        } else if (typeof place.address.suburb !== 'undefined') {
            street = place.address.suburb;
        }

        suggestionResult["route"] = street;
        suggestionResult["street_number"] = street_number;
        suggestionResult["locality"] = locality;
        suggestionResult["country"] = place.address.country;
        suggestionResult["administrative_area_level_1"] = place.address.county;
        suggestionResult["administrative_area_level_2"] = place.address.state;
        suggestionResult["postal_code"] = place.address.postcode;
        suggestionResult["latitude"] = place.lat;
        suggestionResult["longitude"] = place.lon;
        suggestionResult["country_code"] = place.address.country_code;

        return suggestionResult;
    }
};/**
 * JBD Listing javascript class
 */
class JBDListings {

    /**
     * Constructor
     */
    constructor() {
    	this.issetCategory = false;
   	    
        this.todayDate = new Date();
        this.maxDate = new Date();
        this.maxDate.setMonth(this.todayDate.getMonth() + 6);
    }

    /**
     * Set edit and delete location url for front and back end
     *
     * @param eurl string edit url on back end
     * @param eurlf string edit url on front end
     * @param durl string delete url on back end
     * @param durlf string delete url on front end
     */
    setLocationUrl(eurl, eurlf, durl, durlf) {
        this.editUrl = eurl;
        this.editUrlFront = eurlf;
        this.deleteUrl = durl;
        this.deleteUrlFront = durlf;
    }

    /**
     * Based on the fact if it is back end or front end this function set the task value and submits the form with
     * package id passed as parameter
     *
     * @param packageId int package id
     */
    extendPeriod(packageId) {
        if (jbdUtils.getProperty("isProfile") != JBDConstants.IS_ADMIN) {
            jQuery("#task").val("managecompany.extendPeriod");
        } else {
            jQuery("#extend_package_id").val(packageId);
            jQuery("#task").val("company.extendPeriod");
        }

        jQuery("#extend_package_id").val(packageId);
        jQuery("#item-form").submit();
    }

    //TODO do we still need this?
    /**
     * Check all activity cities from select box
     */
    checkAllActivityCities() {
        this.uncheckAllActivityCities();
        jQuery(".cities_ids-select option").each(function () {
            if (jQuery(this).val() != "") {
                activityCitiesList.add(jQuery(this));
            }
        });
        jQuery("#activity_cities option").each(function () {
            jQuery(this).attr("selected", "selected");
        });
    }

    //TODO do we still need this?
    /**
     * Uncheck all activity cities from select box
     */
    uncheckAllActivityCities() {
        jQuery("#activity_cities option").each(function () {
            jQuery(this).removeAttr("selected");
        });
        activityCitiesList.remove();
    }

    /**
     * Based on the check if it is back or front end open the modal with the options passed on parameter
     *
     * @param locationId int location Id
     * @param identifier string identifier
     */
    editLocation(locationId, identifier) {
        let baseUrl = this.editUrl;
        if (jbdUtils.getProperty("isProfile") == JBDConstants.IS_FRONT) {
            baseUrl = this.editUrlFront;
        }
        baseUrl = baseUrl + "&locationId=" + locationId + "&identifier=" + identifier;
        jQuery("#location-frame").attr("src", baseUrl);

        let options = {
            modalClass: "jbd-modal jbd-location"
        };

        jQuery('#location-dialog').jbdModal(options);
    }

    /**
     * Delete secondary location
     *
     * @param locationId int location ID
     */
    deleteLocation(locationId) {
        if (!confirm(Joomla.JText._("LNG_DELETE_LOCATION_CONF"))) {
            return;
        }
        let baseUrl = this.deleteUrl;
        if (jbdUtils.getProperty("isProfile") == JBDConstants.IS_FRONT) {
            baseUrl = this.deleteUrlFront;
        }

        let postData = "&locationId=" + locationId;
        jQuery.post(baseUrl, postData, this.processDeleteLocationResult);
    }

    /**
     * Process the response from deleteLocation function
     *
     * @param response object response
     */
    processDeleteLocationResult(response) {
        let xml = response;
        jQuery(xml).find('answer').each(function () {
            if (jQuery(this).attr('error') == '1')
                jQuery("#location-box-" + jQuery(this).attr('locationId')).remove();
            else {

                let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('LNG_LOCATION_DELETE_FAILED') +'</p>'
    			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div></div></div>';
                
                jQuery(html).appendTo('body').jbdModal();
                setTimeout(function () {
                    jQuery.jbdModal.close()
                }, 2000);
            }
        });
    }

    /**
     * Add new contact div to add a new contact person for the listing
     *
     * @param index int last index of the contacts
     */
    addNewContact(index) {
        let newIndex = parseInt(index) + 1;
        jQuery('#contact-form-box1').clone().prop('id', 'contact-form-box' + newIndex).appendTo('#contact_details');
        jQuery("#contact-form-box" + newIndex).find('h3').text(Joomla.JText._('LNG_CONTACT') + ' ' + newIndex);
        jQuery('#contact-form-box' + newIndex + ' input').each(function () {
            jQuery(this).val('');
        });

        jQuery("#contact-form-box" + newIndex + " .remove-contact").attr('href', 'javascript:jbdListings.removeContact(\'' + newIndex + '\')').show();
        jQuery('#add_contact').attr('onclick', 'jbdListings.addNewContact(\'' + newIndex + '\')');

    }

    /**
     * Remove a contact person from listing contacts
     *
     * @param index int index of the contact
     */
    removeContact(index) {
        if (index < 2) {
            return;
        }

        index = parseInt(index);
        jQuery('#contact-form-box' + index).remove();
    }

    /**
     * Add new testimonial div to add a new testimonial for the listing
     *
     * @param index int last index of the contacts
     */
    addNewTestimonial(index) {
        let newIndex = parseInt(index) + 1;
        jQuery('#testimonial-form-box1').clone().prop('id', 'testimonial-form-box' + newIndex).appendTo('#testimonial_details');
        jQuery("#testimonial-form-box" + newIndex).find('h3').text(Joomla.JText._('LNG_TESTIMONIAL') + ' ' + newIndex);
        jQuery('#testimonial-form-box' + newIndex + ' input').each(function () {
            jQuery(this).val('');
        });

        jQuery('#testimonial-form-box' + newIndex + ' textarea').each(function () {
            jQuery(this).html('');
        });
        jQuery('#testimonial-form-box' + newIndex + ' textarea').val('');

        jQuery("#testimonial-form-box" + newIndex + " .remove-testimonial").attr('href', 'javascript:removeTestimonial(\'' + newIndex + '\')').show();
        jQuery('#add_testimonial').attr('onclick', 'jbdListings.addNewTestimonial(\'' + newIndex + '\')');
    }

    /**
     * Remove a testimonial from listing
     *
     * @param index int index of the testimonial
     */
    removeTestimonial(index) {
        if (index < 2) {
            return;
        }

        index = parseInt(index);
        jQuery('#testimonial-form-box' + index).remove();
    }

    /**
     * Add new service div to add a new service for the listing
     *
     * @param index int last index of the service
     * @param ServiceFolder string name of the folder where the image of the service will be added
     * @param ServiceFolderPath string url path of the service image
     */
    addNewService(index, ServiceFolder, ServiceFolderPath) {
        let newIndex = parseInt(index) + 1;
        jQuery('#service-form-box1').clone().prop('id', 'service-form-box' + newIndex).appendTo('#service_details');
        jQuery("#service-form-box" + newIndex).find('h5').text(Joomla.JText._('LNG_ITEM') + ' ' + newIndex);
        jQuery('#service-form-box' + newIndex + ' input').each(function () {
            jQuery(this).val('');
        });
        jQuery('#service-form-box' + newIndex + ' textarea').each(function () {
            jQuery(this).html('');
        });
        jQuery('#service-form-box' + newIndex + ' textarea').val('');
        jQuery('#service-form-box' + newIndex + ' .input-imageLocation').prop('id', 'service-imageLocation' + newIndex);
        jQuery('#service-form-box' + newIndex + ' .input-imageLocationSize').prop('id', 'service-imageUploader' + newIndex);

        jQuery('#service-form-box' + newIndex + ' .services').prop('id', 'service-picture-preview' + newIndex);
        jQuery('#service-picture-preview' + newIndex).html('<i class="la la-image"></i>');

        jQuery('#service-form-box' + newIndex + ' #imageSelection2').find('a').prop('href', 'javascript:removeServiceLogo(' + newIndex + ')');
        jQuery('#service-form-box' + newIndex + ' #imageSelection2').find('label').prop('for', 'service-imageUploader' + newIndex);
        jQuery('#service-form-box' + newIndex + ' #imageSelection1').find('#service-imageUploader1').prop('id', 'service-imageUploader' + newIndex);
        jQuery('#service-form-box' + newIndex + '').find('#service-imageLocation1').prop('id', 'service-imageLocation' + newIndex);

        jQuery("#service-form-box" + newIndex + " .remove-service").attr('href', 'javascript:removeService(\'' + newIndex + '\')').show();
        jQuery('#add_service').attr('onclick', 'jbdListings.addNewService(\'' + newIndex + '\',\'' + ServiceFolder + '\',\'' + ServiceFolderPath + '\')');

        let uploadInstance = JBDUploadHelper.getUploadInstance();
        uploadInstance.imageUploader(ServiceFolder, ServiceFolderPath, 'service-', newIndex);
    }

    /**
     * Remove a service from listing
     *
     * @param index int index of the service
     */
    removeService(index) {
        if (index < 2) {
            return;
        }

        index = parseInt(index);
        jQuery('#service-form-box' + index).remove();
    }

    /**
     * Disable work period for a specific day but do not remove it
     *
     * @param day int day number
     * @param mandatory bool is it mandatory or not
     * @param multiple
     */
    disableWorkPeriod(day, mandatory, multiple) {
        if (typeof multiple === 'undefined') {
            multiple = true;
        }

        let status;
        let checked = jQuery('#work_status_check_' + day).is(":checked");
        let button;
        let dayRow = jQuery('#js_workhours_' + day);
        if (multiple) {
            dayRow = jQuery('#break_period_' + day);
        }

        if (checked) {
            status = 1;
            jQuery('#work_start_hour_' + day).prop('readonly', false);
            if (mandatory) {
                jQuery('#work_start_hour_' + day).addClass('validate[required]');
                jQuery('#work_end_hour_' + day).addClass('validate[required]');
            }
            jQuery('#work_end_hour_' + day).prop('readonly', false);

            button = dayRow.find('.js_action_buttons').find('a');
            button.text(Joomla.JText._('LNG_ADD_BREAK'));
            button.attr('onclick', 'jbdListings.addBreak(' + day + ', ' + multiple + ')');
            button.attr('disabled', false);
            button.addClass('btn-success');
            button.removeClass('btn-outline-danger');
        }
        else {
            status = 0;
            jQuery('#work_start_hour_' + day).prop('readonly', true);
            if (mandatory) {
                jQuery('#work_start_hour_' + day).removeClass('validate[required]');
                jQuery('#work_end_hour_' + day).removeClass('validate[required]');
            }
            jQuery('#work_end_hour_' + day).prop('readonly', true);

            button = dayRow.find('.js_action_buttons').find('a');
            button.attr('disabled', true);
            button.text(Joomla.JText._('LNG_CLOSED'));
            button.attr('onclick', '');
            button.removeClass('btn-success');
            button.addClass('btn-outline-danger');

            jQuery('#break_hours_day_' + day).empty();
            jQuery('#break_periods_count_' + day).val(0);
        }

        jQuery('#work_status_' + day).val(status);
    }

    /**
     * Add hour breaks for the listing
     *
     * @param day int day number
     * @param multiple bool can be added multiple break hours
     * @returns {boolean}
     */
    addBreak(day, multiple) {
        let id = parseInt(jQuery('#break_periods_count_' + day).val());
        let newId = id + 1;

        let dayRow = jQuery('#js_workhours_' + day);
        let button = dayRow.find('.js_action_buttons').find('a');

        if (typeof button.attr('disabled') !== 'undefined') {
            console.log("cannot add more than 1 break period");
            return false;
        }

        let html = '';
        html += '<div class="row align-items-center" id="break_hour_period_' + day + '_' + newId + '">';
        html += '<div class="col-1 p-1"></div>';
        html += '<div class="col-4"><input type="text" name="break_start_hour[]" class="form-control p-1 text-center timepicker" value="01:00 PM" /></div>';
        html += '<div class="col-4"><input type="text" name="break_end_hour[]" class="form-control p-1 text-center timepicker" value="02:00 PM" /></div>';
        if (multiple) {
            html += '<div class="col-2"><a href="javascript:void(0)" class="btn btn-sm btn-danger btn-panel" onclick="jbdListings.deleteBreak(' + day + ', ' + newId + ')">';
        }
        else {
            html += '<div class="col-2"><a href="javascript:void(0)" class="btn btn-sm btn-danger btn-panel" onclick="jbdListings.deleteCompanyBreak(' + day + ', ' + newId + ')">';
            button.attr('disabled', true);
        }
        html += '<i class="la la-trash"></i>';
        html += '</a></div>';
        html += '<input type="hidden" name="break_ids[]" id="break_ids" value="" />';
        html += '</div>';

        jQuery('#break_hours_day_' + day).append(html);
        jQuery('#break_periods_count_' + day).val(newId);
        if (!multiple) {
            jQuery('#break_period_' + day).find('.break-button').attr('disabled', true);
            jQuery('#break_period_' + day).find('.break-button').attr('onclick', '');
        }

        jQuery('.timepicker').timepicker({'timeFormat': jbdUtils.getProperty("timeFormat"), 'minTime': '6:00am',});
    }

    /**
     * Delete company break hour
     *
     * @param day int day nr
     * @param id int break ID
     */
    deleteCompanyBreak(day, id) {
        jQuery('#break_hour_period_' + day + '_' + id).remove();

        let dayRow = jQuery('#js_workhours_' + day);
        let button = dayRow.find('.js_action_buttons').find('a');

        button.attr('disabled', false);

        jQuery('#break_period_' + day).find('.break-button').removeAttr('disabled');
        let count = jQuery('#break_periods_count_' + day).val();
        if (count > 0) {
            count--;
        }
        jQuery('#break_periods_count_' + day).val(count);
        jQuery('#break_period_' + day).find('.break-button').attr('onclick', 'jbdListings.addBreak(' + day + ', false)');
    }

    /**
     * Delete break hour period on trail weeks
     *
     * @param day string day
     * @param id int ID
     */
    deleteBreak(day, id) {
        jQuery('#break_hour_period_' + day + '_' + id).empty();
        let count = parseInt(jQuery('#break_periods_count_' + day).val());
        let newCount = count - 1;

        jQuery('#break_periods_count_' + day).val(newCount);
    }

    /**
     * Delete a trail period on a given date
     *
     * @param date string date
     */
    disableTrailPeriod(date) {
        let status = jQuery('#trail_status_' + date).val();
        let dateRow = jQuery('.js_trailhours_' + date);
        let button = dateRow.find('.js_action_buttons').find('a');

        let checked = jQuery('#trail_status_checkbox_' + date).is(":checked");

        if (!checked) {
            jQuery('#trail_status_' + date).val(0);
            jQuery('.js_trail_row_' + date).find('.js_trail_hours').attr('disabled', true);

            button.attr('disabled', true);
            button.text(Joomla.JText._('LNG_CLOSED'));
            button.attr('onclick', '');
            button.removeClass('btn-success');
            button.addClass('btn-outline-danger');
        } else {
            jQuery('#trail_status_' + date).val(1);
            jQuery('.js_trail_row_' + date).find('.js_trail_hours').attr('disabled', false);

            button.text(Joomla.JText._('LNG_ADD_BREAK'));
            button.attr('onclick', 'jbdListings.addTrailBreak("' + date + '")');
            button.attr('disabled', false);
            button.addClass('btn-success');
            button.removeClass('btn-outline-danger');
        }
    }

    /**
     * Add new trail break for trail weeks
     *
     * @param date string date
     * @returns {boolean}
     */
    addTrailBreak(date) {
        let dateRow = jQuery('.js_trailhours_' + date);
        let button = dateRow.find('.js_action_buttons').find('a');

        if (typeof button.attr('disabled') !== 'undefined') {
            console.log("cannot add more than 1 break period");
            return false;
        }
        button.attr('disabled', true);

        jQuery('#trail_breaks_status_' + date).val(1);
        jQuery('#trail_break_hours_' + date).show();

        jQuery('.timepicker').timepicker({'timeFormat': jbdUtils.getProperty("timeFormat"), 'minTime': '6:00am',});
    }

    /**
     * Delete break hour for trail weeks
     *
     * @param date string date
     */
    deleteTrailBreak(date) {
        let dateRow = jQuery('.js_trailhours_' + date);
        let button = dateRow.find('.js_action_buttons').find('a');

        jQuery('#trail_breaks_status_' + date).val(0);
        jQuery('#trail_break_hours_' + date).hide();

        button.attr('disabled', false);
    }

    /**
     * Update the attributes on category selection. If linking of categories and attributes is enabled then the attributes
     * will be shown based on the category selection for the item
     *
     * @param categoryId int category id
     * @param companyId int company id
     */
    updateAttributes(categoryId, companyId) {
        let attributesUrl = jbdUtils.getAjaxUrl('getAttributesAjax', 'company', 'managecompany');

        let packageId = 0;
        if (jbdUtils.getProperty('enable_packages') == 1) {
            packageId = jQuery('#filter_package_select').val();
        }

        jQuery.ajax({
            type: "GET",
            url: attributesUrl,
            data: {categoryId: categoryId, companyId: companyId, packageId: packageId},
            dataType: 'json',
            cache:false,
            success: function (data) {
            	
            	if(data!== null && data !== 'undefined'){
            		 jQuery('#custom-attributes-section').show();
            	}else{
            		jQuery('#custom-attributes-section').hide();
            	}
            	
                jQuery('#customFieldsContent').html(data);
                jQuery(".chosen-select").chosen({width: "95%", disable_search_threshold: 5, search_contains: true});
            }
        });
    }

    /**
     * Display subcategories by category selection
     *
     * @param id int category ID
     * @param level int depth level of category
     * @param maxLevel int max level of category
     */
    displaySubcategories(id, level, maxLevel) {
        let categoryId = jQuery("#" + id).val();

        if (!categoryId) {
            categoryId = 0;
        }
        //invalidate subcategories level
        for (let i = level + 1; i <= maxLevel; i++) {
            jQuery("#company_categories-level-" + i).html('');
        }
        jQuery("#company_categories-level-" + (level + 1)).html("<div style='width:20px;margin: 0 auto;'><img align='center' src='" + jbdUtils.getProperty("imageRepo") + "/assets/images/loading.gif'  /></div>");

        let postParameters = '';

        postParameters += "&categoryId=" + categoryId;

        let postData = '';
        if (jbdUtils.getProperty("isProfile") == JBDConstants.IS_ADMIN)
            postData = '&option=com_jbusinessdirectory&task=company.getSubcategories' + postParameters;
        else
            postData = '&option=com_jbusinessdirectory&task=managecompany.getSubcategories' + postParameters;
        jQuery.post(jbdUtils.baseUrl, postData, this.processDisplaySubcategoriesResponse);
        //jQuery('#frmFacilitiesFormSubmitWait').show();
    }

    /**
     * manage response for displaySubcategories function
     *
     * @param response object response
     */
    processDisplaySubcategoriesResponse(response) {
        let xml = response;
        let self = this;
        //jQuery('#frmFacilitiesFormSubmitWait').hide();
        jQuery(xml).find('answer').each(function () {
            if (jQuery(this).attr('error') == '1') {
                jQuery('#frm_error_msg_facility').className = 'text_error';
                jQuery('#frm_error_msg_facility').html(jQuery(this).attr('errorMessage'));
                jQuery('#frm_error_msg_facility').show();

            }
            else if (jQuery(this).attr('error') == '0') {

                jQuery("#subcategories").html(jQuery(this).attr('content_categories'));
                self.removeSelectedCategories();
                //clear current level
                jQuery("#company_categories-level-" + jQuery(this).attr('category-level')).html('');
                //clear next level
                let level = 1 + parseInt(jQuery(this).attr('category-level'));
                jQuery("#company_categories-level-" + level).html('');
                if (jQuery(this).attr('isLastLevel') != '1') {
                    jQuery("#company_categories-level-" + jQuery(this).attr('category-level')).html(jQuery(this).attr('content_select_categories'));

                }
            }
        });
    }

    /**
     * Remove all selected categories from company edit view
     */
    removeSelectedCategories() {
        jQuery("#mainSubcategory > option").each(function () {
            jQuery("#subcategories option[value=" + jQuery(this).val() + "]").remove();
        });
    }

    /**
     * Hide company disapprove div
     */
    hideDisapprovalBox() {
        jQuery("#disapprovalBox").hide();
    }

    /**
     * Show company disapprove div
     */
    showDisapprovalBox() {
        jQuery("#disapprovalBox").show();
    }

    /**
     * Add provider vacation
     *
     * @param id int provider ID
     */
    addVacation(id) {
        id = parseInt(id);
        let newId = id + 1;

        let deleteButton = '';
        deleteButton += '<br/>';
        deleteButton += '<a href="javascript:void(0)" class="btn btn-sm btn-danger btn-panel mb-1" onclick="deleteVacation(' + newId + ')">';
        deleteButton += '<i class="la la-trash"></i>';
        deleteButton += '</a>';

        jQuery('#vacation_0').clone().prop('id', 'vacation_' + newId).insertAfter('#vacation_' + id);
        jQuery('#vacation_' + newId + ' #start_calendar_0').find('input').attr('id', 'start_date_' + newId);
        jQuery('#vacation_' + newId + ' #start_calendar_0').find('input').val('');
        jQuery('#vacation_' + newId + ' #start_calendar_0').find('button').attr('id', 'start_date_' + newId + '_img');
        jQuery('#vacation_' + newId + ' #end_calendar_0').find('input').attr('id', 'end_date_' + newId);
        jQuery('#vacation_' + newId + ' #end_calendar_0').find('input').val('');
        jQuery('#vacation_' + newId + ' #end_calendar_0').find('button').attr('id', 'end_date_' + newId + '_img');
        jQuery('#vacation_' + newId + ' #delete_vacation_0').prop('id', 'delete_vacation_' + newId);
        jQuery('#add_vacation').find('a').attr('onclick', 'addVacation(\'' + newId + '\')');
        jQuery('#delete_vacation_' + newId).html(deleteButton);

        this.initCalendar(newId);
        jQuery('#add_vacation_' + parseInt(id)).remove();
    }

    /**
     * Delete vacation of the provider
     *
     * @param id in provider
     */
    deleteVacation(id) {
        jQuery('#vacation_' + id).empty();
    }

    /**
     * Display company services after the company is selected
     */
    updateServices() {
        let companyId = jQuery('#company_id').find(":selected").val();
        let urlGetServices = jbdUtils.getAjaxUrl('getServicesAjax', 'companyserviceprovider', 'managecompanyserviceprovider');

        jQuery.ajax({
            type: "GET",
            url: urlGetServices,
            data: {companyId: companyId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#services').html(data);
                jbdUtils.updateChosenSelect('#services');
            }
        });
    }

    /**
     * Initiate calendar when selecting the vacation for a provider
     *
     * @param id int provider id
     */
    initCalendar(id) {
        Calendar._DN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        Calendar._SDN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        Calendar._FD = 0;
        Calendar._MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        Calendar._SMN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        Calendar._TT = {
            "INFO": "About the Calendar",
            "ABOUT": "DHTML Date\/Time Selector\n(c) dynarch.com 2002-2005 \/ Author: Mihai Bazon\nFor latest version visit: http:\/\/www.dynarch.com\/projects\/calendar\/\nDistributed under GNU LGPL.  See http:\/\/gnu.org\/licenses\/lgpl.html for details.\n\nDate selection:\n- Use the \u00ab and \u00bb buttons to select year\n- Use the < and > buttons to select month\n- Hold mouse button on any of the buttons above for faster selection.",
            "ABOUT_TIME": "\n\nTime selection:\n- Click on any of the time parts to increase it\n- or Shift-click to decrease it\n- or click and drag for faster selection.",
            "PREV_YEAR": "Select to move to the previous year. Select and hold for a list of years.",
            "PREV_MONTH": "Select to move to the previous month. Select and hold for a list of the months.",
            "GO_TODAY": "Go to today",
            "NEXT_MONTH": "Select to move to the next month. Select and hold for a list of the months.",
            "SEL_DATE": "Select a date.",
            "DRAG_TO_MOVE": "Drag to move.",
            "PART_TODAY": " Today ",
            "DAY_FIRST": "Display %s first",
            "WEEKEND": "0,6",
            "CLOSE": "Close",
            "TODAY": "Today",
            "TIME_PART": "(Shift-)Select or Drag to change the value.",
            "DEF_DATE_FORMAT": "%Y-%m-%d",
            "TT_DATE_FORMAT": "%a, %b %e",
            "WK": "wk",
            "TIME": "Time:"
        };
        Calendar.setup({
            // Id of the input field
            inputField: "start_date_" + id,
            // Format of the input field
            ifFormat: "%d-%m-%Y",
            // Trigger for the calendar (button ID)
            button: "start_date_" + id + "_img",
            // Alignment (defaults to "Bl")
            align: "Tl",
            singleClick: true,
            firstDay: 0,
            defaultDate: new Date()
        });
        Calendar.setup({
            // Id of the input field
            inputField: "end_date_" + id,
            // Format of the input field
            ifFormat: "%d-%m-%Y",
            // Trigger for the calendar (button ID)
            button: "end_date_" + id + "_img",
            // Alignment (defaults to "Bl")
            align: "Tl",
            singleClick: true,
            firstDay: 0,
            defaultDate: new Date()
        });
    }

    /**
     * Update providers after selecting a service
     */
    updateProviders() {
        let serviceId = jQuery('#service_id').find(":selected").val();
        let urlGetProviders = jbdUtils.getAjaxUrl('getProvidersAjax', 'companyservicereservation');

        jQuery('#time-text').empty();
        jQuery('#date-text').empty();

        jQuery.ajax({
            type: "GET",
            url: urlGetProviders,
            data: {serviceId: serviceId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#provider_id').html(data);
            }
        });
    }

    /**
     * Update service reservation dates and hours
     */
    updateDatesAdmin() {
        let urlGetDays = jbdUtils.getAjaxUrl('getVacationDaysAjax', 'companyservicereservation', 'managecompanyservicereservation');
        let providerId = jQuery('#provider_id').find(":selected").val();
        let self = this;

        jQuery.ajax({
            type: "GET",
            url: urlGetDays,
            data: {providerId: providerId},
            dataType: 'json',
            cache:false,
            success: (data) => {
                jQuery('#datepicker').datepicker('destroy');
                jQuery('#datepicker').datepicker({
                    beforeShowDay: function (date) {
                        let string = jQuery.datepicker.formatDate('dd-mm-yy', date);
                        return [data.indexOf(string) == -1]
                    },
                    onSelect: self.getAvailableHoursAdmin,
                    minDate: self.todayDate,
                    maxDate: self.maxDate
                });
            }
        });
    }

    /**
     * Get services available hours on admin with ajax. Same function used also on front end
     *
     * @param date string date
     */
    getAvailableHoursAdmin(date) {
        let urlGetHours = jbdUtils.getAjaxUrl('getAvailableHoursAjax', 'companyservicereservation', 'managecompanyservicereservation');

        let serviceId = jQuery('#service_id').find(":selected").val();
        let providerId = jQuery('#provider_id').find(":selected").val();

        jQuery('#date').val(date);
        jQuery('#date-text').html(date);
        jQuery('#time-text').empty();

        jQuery.ajax({
            type: "GET",
            url: urlGetHours,
            data: {serviceId: serviceId, providerId: providerId, date: date},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#morning').empty();
                jQuery('#afternoon').empty();
                jQuery('#evening').empty();

                jQuery('#morning').append(data.morning);
                jQuery('#afternoon').append(data.afternoon);
                jQuery('#evening').append(data.evening);

                //TODO global reference
                selectedDate = date;
            }
        });
    }

    /**
     * Select hour on admin for services
     *
     * @param time string time
     */
    selectHourAdmin(time) {
        jQuery('#time').val(time);
        jQuery('#time-text').html(time);
    }

    /**
     * Shows event appointment modal
     */
    showAppointmentDialog() {
        jQuery('#event-appointment').jbdModal();
        jQuery('.timepicker').timepicker({'timeFormat': jbdUtils.getProperty("timeFormat"), 'minTime': '6:00am'});
    }

    /**
     * Shows event appointment modal and display the available dates
     *
     * @param eventId int event ID
     * @param eventStartDate string event start date
     * @param eventEndDate string event end date
     */
    makeAppointment(eventId, eventStartDate, eventEndDate) {
        this.showAppointmentDialog();
        jQuery('#eventId-appoint').val(eventId);
        this.listAvailableDates(eventStartDate, eventEndDate);
    }

    /**
     * List available dates for the appointment that is booked for the event
     *
     * @param eventStartDate string event start date
     * @param eventEndDate string event end date
     */
    listAvailableDates(eventStartDate, eventEndDate) {
        let dStart;
        let dEnd;

        if (eventStartDate.length === 0 || eventStartDate == null || eventStartDate === "0000-00-00") {
            dStart = new Date();
        } else {
            dStart = new Date(eventStartDate);
        }

        if (eventEndDate.length === 0 || eventEndDate == null || eventEndDate === "0000-00-00") {
            dEnd = new Date();
            dEnd.setDate(dStart.getDate() + 20);
        } else {
            dEnd = new Date(eventEndDate);
        }

        let dNow = new Date();
        if (dNow > dStart && dNow < dEnd) {
            dStart = dNow;
        }

        let select = document.getElementById("date-appoint");

        let i = 0;
        while (dStart <= dEnd && i <= 20) {
            let opt = document.createElement('option');
            opt.value = dStart.toDateString();
            opt.innerHTML = dStart.toDateString();
            select.appendChild(opt);

            dStart.setDate(dStart.getDate() + 1);
            i++;
        }
    }

    /**
     * Select a service and go to the next step on service selection
     *
     * @param id int service ID
     */
    selectService(id) {
        serviceId = id;
        providerId = 0;

        wizard.steps("next");
    }

    /**
     * After selecting a service provider go to the next step on service selection
     *
     * @param id int provider ID
     */
    selectProvider(id) {
        providerId = id;
        providerName = jQuery('#provider-' + id).text();
        serviceName = jQuery('.selected-service').text();
        jQuery('#morning').empty();
        jQuery('#afternoon').empty();
        jQuery('#evening').empty();

        wizard.steps("next");
    }

    /**
     * Add the selected hour and go the finish step on the service selection
     *
     * @param hour string hour
     */
    selectHour(hour) {
        selectedHour = hour;

        wizard.steps("finish");
    }

    /**
     * Render providers with ajax and add them to providers-content div
     */
    renderProviders() {
        let urlGetProviders = jbdUtils.getAjaxUrl('getServiceProvidersAjax', 'companies');

        jQuery.ajax({
            type: "GET",
            url: urlGetProviders,
            data: {serviceId: serviceId},
            dataType: 'json',
            cache: false,
            success: function (data) {
                jQuery('#providers-content').html(data);
            }
        });
    }

    /**
     * Get vacation days for a service provider by ajax
     */
    getVacationDates() {
        let urlGetDays = jbdUtils.getAjaxUrl('getVacationDaysAjax', 'companies');
        let self = this;

        jQuery('.selected-provider-service').text(serviceName);
        jQuery('.selected-provider').text(providerName);

        jQuery.ajax({
            type: "GET",
            url: urlGetDays,
            data: {providerId: providerId},
            dataType: 'json',
            cache: false,
            success: function (data) {
                jQuery('#datepicker').datepicker('destroy');
                jQuery('#datepicker').datepicker({
                    beforeShowDay: function (date) {
                        let string = jQuery.datepicker.formatDate('dd-mm-yy', date);
                        return [data.indexOf(string) == -1]
                    },
                    onSelect: self.getAvailableHours,
                    minDate: self.todayDate,
                    maxDate: self.maxDate
                });

                let todayString = jQuery.datepicker.formatDate('dd-mm-yy', self.todayDate);
                if (data.indexOf(todayString) == -1) {
                    self.getAvailableHours(self.todayDate);
                }
            }
        });
    }

    /**
     * get available hours of listing on a date given
     *
     * @param date string date
     */
    getAvailableHours(date) {
        let urlGetHours = jbdUtils.getAjaxUrl('getAvailableHoursAjax', 'companies');

        let hoursD = new Date(date);
        let hoursDate = jQuery.datepicker.formatDate('dd-mm-yy', hoursD);
        jQuery.ajax({
            type: "GET",
            url: urlGetHours,
            data: {serviceId: serviceId, providerId: providerId, date: hoursDate},
            dataType: 'json',
            cache: false,
            success: function (data) {
                jQuery('#morning').empty();
                jQuery('#afternoon').empty();
                jQuery('#evening').empty();

                jQuery('#morning').append(data.morning);
                jQuery('#afternoon').append(data.afternoon);
                jQuery('#evening').append(data.evening);

                //TODO global reference
                selectedDate = hoursDate;
            }
        });
    }

    /**
     * Initiate tabs on list detail view 1 and 2
     *
     * @param tabId int tab ID
     */
    initTabs(tabId) {
        jQuery("#tabs").tabs();

        jQuery("#dir-tab-2").click(function () {
            //TODO global reference
            loadDetailsViewMap();
        });

        jQuery(".dir-tabs-options").click(function () {
            jQuery(".dir-tabs-options").each(function () {
                jQuery(this).removeClass("ui-state-active");
            });
            jQuery(this).addClass("ui-state-active");
        });

        jQuery("#dir-tab-" + tabId).click();
    }

    /**
     * Open Map on details view of the listing
     */
    showCompanyMap() {
        jQuery("#company-map-holder").show();
        //TODO global reference
        loadDetailsViewMap();
    }

    /**
     * Used on listing style 4,6 and 8 to navigate through the tabs
     *
     * @param identifier string tab name (identifier)
     */
    showDetails(identifier) {
        let ids = ["company-details", "company-announcements", "company-gallery", "company-videos", "company-sounds", "company-offers", "company-products", "company-related", "company-services", "company-associated", "company-events", "events-associated", "company-testimonials", "company-price-list", "company-projects", "company-memberships","listing-articles", "company-reviews"];

        let pos = ids.indexOf(identifier);

        jQuery(".company-menu a").each(function () {
            jQuery(this).removeClass("active");
        });

        //if (identifier === "company-projects") {
        this.returnToProjects();
        //}

        let linkIdentifier = identifier.substring(identifier.indexOf("-") + 1, identifier.length);
        jQuery("#" + linkIdentifier + "-link").addClass("active");

        for (let i = 0; i < pos; i++) {
            jQuery("#" + ids[i]).slideUp();
        }

        for (let i = pos; i < ids.length; i++) {
            jQuery("#" + ids[i]).slideDown();
        }
    }

    /**
     * Used on listing details view 6 to navigate through the tabs
     *
     * @param identifier string tab name (identifier)
     */
    showTabContent(identifier) {
        let ids = ["company-details", "company-events","company-projects", "company-attachments","company-gmap", "company-testimonials", "company-services","company-service","company-team", "company-price-list", "custom-tab", "company-announcements", "company-products", "company-reviews","company-videos", "company-offers"];

        jQuery(".company-menu a").each(function () {
            jQuery(this).removeClass("active");
        });

        let linkIdentifier = identifier.substring(identifier.indexOf("-") + 1, identifier.length);
        jQuery("#" + linkIdentifier + "-link").addClass("active");

        jQuery("#" + identifier).show();
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== identifier)
                jQuery("#" + ids[i]).hide();
        }

        if (identifier === "company-projects") {
            this.returnToProjects();
        }

        if (identifier === "company-gmap") {
            //TODO global reference
            loadDetailsViewMap();
        }

        if (identifier === "company-products") {
            this.goBack();
        }

        if (identifier === "company-offers") {
            jQuery('.offers-container').removeAttr("style");
        }
    }

    /**
     * Render user average rating
     *
     * @param averageRating double average rating
     * @param companyId int company ID
     * @param showNotice boolean show login notice if user not logged in
     */
    renderUserAverageRating(averageRating, companyId, showNotice) {
        let self = this;

        jQuery('.user-rating-avg').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            starCaptions: {
                0.5: Joomla.JText._('LNG_BAD'),
                1: Joomla.JText._('LNG_BAD'),
                1.5: Joomla.JText._('LNG_POOR'),
                2: Joomla.JText._('LNG_POOR'),
                2.5: Joomla.JText._('LNG_REGULAR'),
                3: Joomla.JText._('LNG_REGULAR'),
                3.5: Joomla.JText._('LNG_GOOD'),
                4: Joomla.JText._('LNG_GOOD'),
                4.5: Joomla.JText._('LNG_GORGEOUS'),
                5: Joomla.JText._('LNG_GORGEOUS')
            },
            size: 'sm',
            showCaption: false,
            starCaptionClasses: {
                0.5: 'badge badge-danger',
                1: 'badge badge-danger',
                1.5: 'badge badge-warning',
                2: 'badge badge-warning',
                2.5: 'badge badge-info',
                3: 'badge badge-info',
                3.5: 'badge badge-primary',
                4: 'badge badge-primary',
                4.5: 'badge badge-success',
                5: 'badge badge-success'
            },
            clearCaption: Joomla.JText._('LNG_NOT_RATED_YET'),
            clearCaptionClass: 'badge badge-default',
            hoverEnabled: false,
            hoverChangeCaption: false,
            hoverChangeStars: false,
            rtl: false,
            displayOnly: true,
        });

        jQuery('.user-rating-avg').on('rating:change', function (event, value, caption) {
            if (showNotice == 1) {
                jQuery(this).rating('update', jQuery(this).attr('title'));
                jbdUtils.showLoginNotice();
            }
            else {
                self.updateCompanyRate(companyId, value);
            }
        });

        jQuery('.user-rating-avg').on('rating:clear', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });

        jQuery('.user-rating-avg').on('rating:reset', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });
    }

    /**
     * Open review form for a new review. Checks also if user needs to be logged in to leave a review
     *
     * @param requiresLogin boolean true if user needs to be logged in to review the company and currently he is
     *                         false if user needs to be logged in to review the company but he is not currently logged in
     */
    showReviewForm(requiresLogin) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            jQuery("#add-review").slideDown(500);
        }
    }

    /**
     * Render rating criteria for reviews while adding a new review
     *
     * @param calculate_review_criterias boolean to include the review criterias or not
     * @param companyId int company ID
     */
    renderRatingCriteria(calculate_review_criterias, companyId) {
        let self = this;

        jQuery('.rating-criteria').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            starCaptions: {
                0.5: Joomla.JText._('LNG_BAD'),
                1: Joomla.JText._('LNG_BAD'),
                1.5: Joomla.JText._('LNG_POOR'),
                2: Joomla.JText._('LNG_POOR'),
                2.5: Joomla.JText._('LNG_REGULAR'),
                3: Joomla.JText._('LNG_REGULAR'),
                3.5: Joomla.JText._('LNG_GOOD'),
                4: Joomla.JText._('LNG_GOOD'),
                4.5: Joomla.JText._('LNG_GORGEOUS'),
                5: Joomla.JText._('LNG_GORGEOUS')
            },
            size: 'sm',
            showCaption: true,
            starCaptionClasses: {
                0.5: 'badge badge-danger',
                1: 'badge badge-danger',
                1.5: 'badge badge-warning',
                2: 'badge badge-warning',
                2.5: 'badge badge-info',
                3: 'badge badge-info',
                3.5: 'badge badge-primary',
                4: 'badge badge-primary',
                4.5: 'badge badge-success',
                5: 'badge badge-success'
            },
            clearCaption: Joomla.JText._('LNG_NOT_RATED_YET'),
            clearCaptionClass: 'badge badge-default',
            hoverEnabled: true,
            hoverChangeCaption: true,
            hoverChangeStars: true,
            rtl: false,
        });

        jQuery('.rating-criteria').on('rating:change', function (event, value, caption) {
            jQuery(this).parent().parent().parent().children("input").val(value);
            if (calculate_review_criterias == 1) {
                let total = 0;
                let count = 0;
                jQuery(".review-criterias").each(function () {
                    count++;
                    total += parseFloat(jQuery(this).val());
                });
                if (!isNaN(total)) {
                    value = total * 1.0 / count;
                }
            }
            self.updateCompanyRate(companyId, value);
        });

        jQuery('.rating-criteria').on('rating:clear', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });

        jQuery('.rating-criteria').on('rating:reset', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });
    }

    /**
     * Render review questions on adding review section.
     */
    renderRatingQuestions() {
        jQuery('.rating-question').rating({
            min: 0,
            max: 10,
            step: 0.5,
            stars: 10,
            size: 'sm',
            showCaption: false,
            hoverEnabled: true,
            hoverChangeCaption: false,
            hoverChangeStars: true,
            rtl: false,
            displayOnly: false,
        });

        jQuery('.rating-question').on('rating:change', function (event, value, caption) {
            jQuery(this).parent().parent().parent().children("input").val(value);
        });

        jQuery('.rating-question').on('rating:clear', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });

        jQuery('.rating-question').on('rating:reset', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });
    }

    /**
     * Display review questions
     *
     * @param reviewId int review question Id
     */
    showReviewQuestions(reviewId) {
        let self = this;
        let maxLength = 100;
        jQuery("#show-questions" + reviewId).text(Joomla.JText._('LNG_HIDE_REVIEW_QUESTIONS'));
        jQuery("#show-questions" + reviewId).attr('onclick', 'hideReviewQuestions("' + reviewId + '")');
        jQuery("#review-questions" + reviewId).slideDown(500);
        jQuery('#review-questions' + reviewId).children('.review-question-answer').each(function () {
            if (jQuery(this).hasClass('star-rating')) {
                self.showStarRating(jQuery(this).attr('id'));
            } else {
                jQuery(this).html(jbdUtils.truncate(jQuery(this).text(), jQuery(this).attr('id'), maxLength));
            }
        });
    }

    /**
     * Hide review Questions
     *
     * @param reviewId int review ID
     */
    hideReviewQuestions(reviewId) {
        jQuery("#show-questions" + reviewId).text(Joomla.JText._('LNG_SHOW_REVIEW_QUESTIONS'));
        jQuery("#show-questions" + reviewId).attr('onclick', 'jbdListings.showReviewQuestions("' + reviewId + '")');
        jQuery("#review-questions" + reviewId).slideUp(500);
    }

    /**
     * Show start rating for listing
     *
     * @param answerId int answerId
     */
    showStarRating(answerId) {
        let id = answerId.slice(15, answerId.length);
        jQuery('#' + answerId).empty();
        jQuery('#' + answerId).rating({
            min: 0,
            max: 10,
            step: 0.5,
            stars: 10,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('#' + answerId).rating('update', jQuery('#star-rating-score' + id).val());
    }

    /**
     * After the review question answers are submitted they have the option to be edited and when it is enabled open the possibility
     * to change the answer
     *
     * @param answerId int answer ID
     * @param answerType int answer Type
     */
    editAnswer(answerId, answerType) {
        let answerDiv = jQuery("#question-answer" + answerId);
        let answer = answerDiv.text();
        let data;
        let score;

        let self = this;

        if (answerType == 0) {
            jbdUtils.showFullText(answerId);
            answer = answerDiv.text();
            data = '<textarea style="width:100%;" name="answer-' + answerId + '" id="answer-' + answerId + '" onblur="saveAnswer(\'' + answerId + '\', \'' + answerType + '\')" >' + answer + '</textarea>';
        } else if (answerType == 1) {
            let yes = answer == Joomla.JText._('LNG_YES') ? 'checked="checked"' : "";
            let no = answer == Joomla.JText._('LNG_NO') ? 'checked="checked"' : "";
            data = '<input type="radio" id="answer-' + answerId + '" value="1" onclick="saveAnswer(\'' + answerId + '\', \'' + answerType + '\')" name="answer-' + answerId + '"' + yes + '>' + Joomla.JText._("LNG_YES") + '</input>';
            data += ' <input type="radio" id="answer-' + answerId + '" value="0" onclick="saveAnswer(\'' + answerId + '\', \'' + answerType + '\')" name="answer-' + answerId + '"' + no + '>' + Joomla.JText._("LNG_NO") + '</input>';
        } else if (answerType == 2) {
            data = '<div class="rating-answer"></div>';
            score = parseFloat(answer);
        }

        jQuery("#question-answer" + answerId).attr('class', '');
        answerDiv.html(data);

        if (answerType == 2) {
            jQuery('.rating-answer').rating({
                min: 0,
                max: 10,
                step: 0.5,
                stars: 10,
                size: 'sm',
                showCaption: false,
                hoverEnabled: true,
                hoverChangeCaption: false,
                hoverChangeStars: true,
                rtl: false,
                displayOnly: false,
            });

            jQuery('.rating-answer').on('rating:change', function (event, value, caption) {
                jQuery(this).parent().parent().parent().children("input").val(value);
                document.getElementById('star-rating-score' + answerId).value = value;
                self.saveAnswer(answerId, answerType);
            });

            jQuery('.rating-answer').on('rating:clear', function (event) {
                jQuery(this).parent().parent().parent().children("input").val(0);
            });

            jQuery('.rating-answer').on('rating:reset', function (event) {
                jQuery(this).parent().parent().parent().children("input").val(0);
            });
        }
    }

    /**
     * Save question answer on reviews section with ajax after editing it
     *
     * @param answerId int answer ID
     * @param answerType int answer Type
     */
    saveAnswer(answerId, answerType) {
        let data;
        let self = this;

        if (answerType == 0) {
            data = jQuery("#answer-" + answerId).val();
        } else if (answerType == 1) {
            data = jQuery("input[name='answer-" + answerId + "']:checked").val();
        } else if (answerType == 2) {
            data = jQuery("#star-rating-score" + answerId).val();
        }

        let urlSaveAnswerAjax = jbdUtils.getAjaxUrl('saveAnswerAjax', 'companies');
        jQuery.ajax({
            type: "GET",
            url: urlSaveAnswerAjax,
            data: {answer: data, answerId: answerId},
            dataType: 'json',
            cache:false,
            success: function () {
                jQuery("#question-answer" + answerId).empty();
                if (answerType == 1) {
                    if (data == 0)
                        data = Joomla.JText._('LNG_NO');
                    else if (data == 1)
                        data = Joomla.JText._('LNG_YES');
                }
                if (answerType != 2)
                    jQuery("#question-answer" + answerId).text(data);
                else {
                    self.showStarRating('question-answer' + answerId);
                }
            }
        });

        if (answerType != 2) {
            jQuery("#question-answer" + answerId).attr('class', 'answer question-answer');
        } else {
            jQuery("#question-answer" + answerId).attr('class', 'answer star-rating');
        }
    }

    /**
     * When an image is clicked magnify it
     *
     * @param htmlClass string image gallery class
     */
    magnifyImages(htmlClass) {
        jQuery('.' + htmlClass).magnificPopup({
            delegate: 'a',
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 2] // Will preload 0 - before current, and 1 after the current image
            },
            image: {
                tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
                titleSrc: function (item) {
                    return item.el.attr('title');
                }
            }
        });
    }

    /**
     * Render average rating on listing details view
     *
     * @param averageRating int rating that will be displayed (listing average rating)
     */
    renderAverageRating(averageRating) {
        jQuery('#rating-average').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('#rating-average').rating('update', averageRating);
    }

    /**
     * Render review rating on listing detail view
     */
    renderReviewRating() {
        jQuery('.rating-review').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('.rating-review').each(function () {
            jQuery(this).rating('update', this.title);
        });
    }

    /**
     * Open tab with id given to the parameters
     *
     * @param tabId int tab ID
     */
    showTab(tabId) {
        jQuery("#tabId").val(tabId);
        jQuery("#tabsForm").submit();
    }

    /**
     * Used to display the company claim modal. Checks if user is needed to be logged in then if he is show
     * the dialog otherwise show the login notice
     *
     * @param requiresLogin boolean true if user needs to be logged in to claim the company and currently he is
     *                         false if user needs to be logged in to claim the company but he is not currently logged in
     */
    claimCompany(requiresLogin) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            jQuery(".error_msg").each(function () {
                jQuery(this).hide();
            });
            this.showClaimDialog();
        }
    }

    /**
     * Display claim dialog modal
     */
    showClaimDialog() {
        jQuery('#company-claim').jbdModal();
    }

    /**
     * Used on listing detail view style one and two to go through the tabs of the view
     *
     * @param tab string tab id that need to be opened
     */
    showDirTab(tab) {
        jQuery(".dir-tab").each(function () {
            jQuery(this).hide();
        });

        jQuery(tab).show();
        jQuery(".track-business-details").each(function () {
            jQuery(this).parent().removeClass("active");
        });

        let number = tab.substr(tab.indexOf("-") + 1, tab.length);
        jQuery("#dir-tab-" + number).parent().addClass("active");

        this.returnToProjects();
    }

    /**
     * Change the company owner with ajax
     *
     * @param companyId int company ID
     * @param userId int new owner ID
     */
    updateCompanyOwner(companyId, userId) {
        let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">Please wait...</p>'
		+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div></div></div>';

        jQuery(html).appendTo('body').jbdModal();

        jQuery("#company-claim button").each(function () {
            jQuery(this).attr("disabled", "disabled");
        });

        let form = document.reportAbuse;
        let postParameters = '';
        postParameters += "&companyId=" + companyId;
        postParameters += "&userId=" + userId;
        let postData = '&controller=companies&task=companies.updateCompanyOwner' + postParameters;
        jQuery.post(jbdUtils.baseUrl, postData, this.processUpdateCompanyOwner);
    }

    /**
     * Handle response from updateCompanyOwner ajax function
     *
     * @param response object response
     */
    processUpdateCompanyOwner(response) {
        let xml = response;
        jQuery(xml).find('answer').each(function () {
            let message = '';
            if (jQuery(this).attr('result') == true) {
                message = Joomla.JText._('LNG_CLAIM_SUCCESSFULLY');
                jQuery("#claim-container").hide();
            } else {
                message = Joomla.JText._('LNG_ERROR_CLAIMING_COMPANY');
                //alert('notsaved');
            }

            let html = '<span class="loading-message">' + message + '</span>';
            jQuery(html).appendTo('body').jbdModal();
            setTimeout(function () {
                jQuery.jbdModal.close()
            }, 2000);
        });
    }

    /**
     * Displays the report abuse modal
     */
    showReportAbuse() {
        jQuery('#reportAbuseEmail').jbdModal();
    }

    /**
     * Render the review rating for grid view on the listings
     *
     * @param id int review ID
     */
    renderGridReviewRating(id) {

        jQuery('.rating-review-' + id).rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('.rating-review-' + id).each(function () {
            jQuery(this).rating('update', this.title);
        });
    }

    /**
     * Displayes the company quote modal
     *
     * @param companyId int company ID
     */
    showQuoteCompanyForm(companyId) {
        jQuery("#company-quote #companyId").val(companyId);
        jQuery('#company-quote').jbdModal();
    }

    /**
     * Used to display the company request quote modal on list view. Checks if user is needed to be logged in then if he is show
     * the dialog otherwise show the login notice
     *
     * @param companyId int company ID
     * @param showData boolean true if user needs to be logged in to request quote to the company and currently he is
     *                         false if user needs to be logged in to request quote to the company but he is not currently logged in
     */
    showQuoteCompany(companyId, showData) {
        if (showData == 0) {
            jbdUtils.showLoginNotice();
        } else {
            jQuery(".error_msg").each(function () {
                jQuery(this).hide();
            });
            this.showQuoteCompanyForm(companyId);
        }
    }

    /**
     * Used to display the company contact modal on list view. Checks if user is needed to be logged in then if he is show
     * the dialog otherwise show the login notice
     *
     * @param companyId int company ID
     * @param showData boolean true if user needs to be logged in to contact the company and currently he is
     *                         false if user needs to be logged in to contact the company but he is not currently logged in
     */
    showContactCompanyList(companyId, showData) {
        if (showData == 0) {
            jbdUtils.showLoginNotice();
        } else {
            jQuery(".error_msg").each(function () {
                jQuery(this).hide();
            });
            jQuery("#company-contact #companyId").val(companyId);
            this.showContactCompany();
        }
    }

    /**
     * Validates the company request quote form on the modal and if everything is OK then submit a ajax call to request the
     * quote
     */
    requestQuoteCompany() {
        let baseurl = jbdUtils.getAjaxUrl('requestQuoteCompanyAjax', 'companies');

        let isError = jQuery("#quoteCompanyFrm").validationEngine('validate');
        if (!isError)
            return;

        jQuery("#company-quote button").each(function () {
            jQuery(this).attr("disabled", "disabled");
        });

        //loading button animation if validation is OK
        jQuery(".quote-submit-button").addClass("loader");

        let postData = "";
        postData += "&firstName=" + jQuery("#company-quote #firstName-quote").val();
        postData += "&lastName=" + jQuery("#company-quote #lastName-quote").val();
        postData += "&email=" + jQuery("#company-quote #email-quote").val();
        postData += "&description=" + jQuery("#company-quote #description-quote").val();
        postData += "&companyId=" + jQuery("#company-quote #companyId").val();
        postData += "&category=" + jQuery("#company-quote #category").val();
        postData += "&g-recaptcha-response=" + jQuery("#company-quote .g-recaptcha-response").val();

        jQuery("#quoteCompanyFrm .jbd-commit").addClass("loader");

        jQuery.post(baseurl, postData, this.processQuoteCompanyResult);
    }

    /**
     * Validates the company contact form on the modal and if everything is OK then submit a ajax call to contact the
     * company
     */
    contactCompanyList() {
        let isError = jQuery("#contactCompanyFrm").validationEngine('validate');
        if (!isError)
            return;

        jQuery("#contactCompanyFrm button").each(function () {
            jQuery(this).attr("disabled", "disabled");
        });

        //loading button animation if validation is OK
        jQuery(".contact-submit-button").addClass("loader");

        let postData = "";
        postData += "&firstName=" + jQuery("#company-contact #firstName").val();
        postData += "&lastName=" + jQuery("#company-contact #lastName").val();
        postData += "&email=" + jQuery("#company-contact #email").val();
        postData += "&description=" + jQuery("#company-contact #description").val();
        postData += "&companyId=" + jQuery("#company-contact #companyId").val();
        postData += "&recaptcha_response_field=" + jQuery("#captcha-div-contact #recaptcha_response_field").val();
        postData += "&g-recaptcha-response=" + jQuery("#captcha-div-contact #g-recaptcha-response").val();

        jQuery.post(contactListUrl, postData, this.processContactCompanyResult);
    }

    /**
     * Show company contact modal
     */
    showContactCompany() {
        jQuery('#company-contact').jbdModal();
    }

    /**
     * If showData is false it means that the user need to be logged in to view the data and currently he is not so display
     * the login notice otherwise open the company contact modal
     *
     * @param showData boolean true if user needs to be logged in to contact the company and currently he is
     *                         false if user needs to be logged in to contact the company but he is not currently logged in
     */
    contactCompany(showData) {
        if (showData == 0) {
            jbdUtils.showLoginNotice();
        } else {
            jQuery(".error_msg").each(function () {
                jQuery(this).hide();
            });
            this.showContactCompany();
        }
    }

    /**
     * Ajax function to create registering request (join request) for the listings selected on the popup.
     * It sends a request with all the data and based on the results it get displays a success message or an error one if
     * the registration request failed
     *
     * @param $companyId int company ID
     * @param multipleListings boolean true if user owns more than one listing
     */
    joinCompany($companyId,multipleListings) {
        let baseUrl = jbdUtils.getAjaxUrl('joinCompany', 'companies');
        let selectedValues = jQuery('#userAssociatedCompanies').val();
        let companyIds = '';
        if (multipleListings && Array.isArray(selectedValues)) {
            companyIds = selectedValues.join();
        }
        jQuery(".associated-buttons button").each(function () {
            jQuery(this).attr("disabled", "disabled");
        });

        //loading button animation if validation is OK
        jQuery(".jbd-commit-associated").addClass("loader");

        jQuery.ajax({
            type: "GET",
            url: baseUrl,
            cache:false,
            data: {
                companyIds: companyIds,
                multipleListings: multipleListings,
                mainCompanyId:$companyId
            },
            dataType: 'json',
            success: function (data) {
                if (data.error == '1') {
                    
                    let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('COM_JBUSINESS_ERROR') +'</p>'
        			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div> <div class="jmodal-body"><p>' + data.message + '</p></div> </div></div>';
                    
                    jQuery(html).appendTo('body').jbdModal();
                    setTimeout(function () {
                        jQuery.jbdModal.close();
                        location.reload(true);
                    }, 1200);
                } else {
                    let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('COM_JBUSINESS_DIRECTORY_COMPANY_REGISTERED') +'</p>'
        			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div></div></div>';
                    jQuery(html).appendTo('body').jbdModal();
                    setTimeout(function () {
                        jQuery.jbdModal.close();
                        location.reload(true);
                    }, 1200);
                }
            }
        });
    }

    /**
     * If user owns more that one listing or if he already has joined then display the join popup. Otherwise proceed right
     * away with listing join
     *
     * @param $companyId int company ID
     * @param multipleListings boolean true if user owns multiplelistings
     * @param nrJoined int number of listings already joined
     */
    showCompanyListDialog($companyId,multipleListings,nrJoined) {
        if (multipleListings || nrJoined > 0) {
            jQuery('#company-list').jbdModal();
        } else {
            jbdListings.joinCompany($companyId,multipleListings);
        }
    }

    /**
     * Checks if user is logged in and if yes it proceeds with listing join otherwise shows the login notice
     *
     * @param nrJoined int number of listings that are already joined
     * @param $companyId int company ID
     * @param userId int user ID
     * @param multipleListings boolean treu if user owns more than one listing
     */
    joinListing(nrJoined,$companyId,userId,multipleListings) {
        if (userId == 0) {
            jbdUtils.showLoginNotice();
        } else {
            this.showCompanyListDialog($companyId,multipleListings,nrJoined);
        }
    }

    /**
     * Handle the response from contactCompany and requestQuoteCompany functions
     *
     * @param responce object response
     */
    processContactCompanyResult(response) {
        //remove loader
        jQuery("#quoteCompanyFrm .jbd-commit").removeClass("loader");

        //enable the buttons
        jQuery("#quoteCompanyFrm button").each(function () {
            jQuery(this).removeAttr('disabled');
        });

        let xml = response;
        jQuery(xml).find('answer').each(function () {
            if (jQuery(this).attr('error') == '1') {
                let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('COM_JBUSINESS_ERROR') +'</p>'
    			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div> <div class="jmodal-body"><p>' +jQuery(this).attr('errorMessage') + '</p></div> </div></div>';

                jQuery(html).appendTo('body').jbdModal();
                setTimeout(function () {
                    jQuery.jbdModal.close()
                }, 2000);
            } else {
                let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('COM_JBUSINESS_DIRECTORY_COMPANY_CONTACTED') +'</p>'
    			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div></div></div>';

                jQuery(html).appendTo('body').jbdModal();
                setTimeout(function () {
                    jQuery.jbdModal.close()
                }, 2000);

                if ((typeof  jQuery(this).attr('redirect_url') !== 'undefined') && (jQuery(this).attr('redirect_url') != "")) {
                    window.location.href = jQuery(this).attr('redirect_url');
                }
            }
        });
    }

    /**
     * Render listings rating for the search view
     */
    renderSearchAverageRating() {
        jQuery('.rating-average').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });
        jQuery('.rating-average').each(function () {
            jQuery(this).rating('update', this.title);
        });
    }

    /**
     * Set the instance category status and category ID
     *
     * @param status int category status
     * @param categoryId int category ID
     */
    setCategoryStatus(status, categoryId) {
        this.issetCategory = status;
        this.cat_id = categoryId;
    }

    /**
     * Set the selected category on the search fields and submits the form
     */
    saveSelectedCategory() {
        let catId;
        let checked = jQuery("#filterCategoryItems input[type='checkbox']:checked");
        catId = checked.attr('id');

        if (this.issetCategory) {
            catId = this.cat_id;
        }

        jQuery("#adminForm #categoryId").val(catId);
        jQuery("#adminForm input[name=limitstart]").val(0);
    }

    /**
     * Show list view mode on listing search view
     */
    showList() {
        jQuery("#jbd-results-container").show();
        jQuery("#jbd-grid-view").hide();

        jQuery("#grid-view-link").removeClass("active");
        jQuery("#list-view-link").addClass("active");
    }

    /**
     * Show grid mode for listing on search view
     */
    showGrid() {
        jQuery("#jbd-results-container").hide();
        jQuery("#jbd-grid-view").show();
        jQuery(window).resize();

        jQuery("#grid-view-link").addClass("active");
        jQuery("#list-view-link").removeClass("active");
    }

    /**
     * Add selected category to search params on listing search view
     *
     * @param type string type of rule
     * @param id int id of the rule selected
     */
    addFilterRule(type, id) {
        let val = type + '=' + id + ';';
        if (jQuery("#selectedParams").val().length > 0) {
            jQuery("#selectedParams").val(jQuery("#selectedParams").val() + val);
        } else {
            jQuery("#selectedParams").val(val);
        }
        if (!this.issetCategory) {
            jQuery("#filter_active").val("1");
        }
        jQuery("#adminForm input[name=limitstart]").val(0);
        this.saveSelectedCategory();
        jQuery("#adminForm").submit();
    }

    /**
     * Remove the selected search filter option and submits the form
     *
     * @param type string type of the rule
     * @param id int the selected value of the rule
     */
    removeFilterRule(type, id) {
        let val = type + '=' + id + ';';
        let str = jQuery("#selectedParams").val();
        jQuery("#selectedParams").val((str.replace(val, "")));
        jQuery("#filter_active").val("1");
        this.saveSelectedCategory();

        if (type == "city")
            jQuery("#adminForm #city-search").val("");
        if (type == "region")
            jQuery("#adminForm #region-search").val("");
        if (type == "country")
            jQuery("#adminForm #country-search").val("");
        if (type == "type")
            jQuery("#adminForm #type-search").val("");
        if (type == "province")
            jQuery("#adminForm #province-search").val("");

        jQuery("#adminForm").submit();
    }

    /**
     * Set radius for search and submits the form
     *
     * @param radius int radius search
     */
    setRadius(radius) {
        jQuery("#adminForm > #radius").val(radius);
        jQuery("#adminForm input[name=limitstart]").val(0);
        jQuery("#adminForm").submit();
    }

    /**
     * Filter by fav items on search view.
     *
     * @param requiresLogin
     */
    filterByFavorites(requiresLogin) {
        if (!requiresLogin) {
            jQuery("#adminForm #filter-by-fav").val("1");
            jQuery("#adminForm").submit();
        } else {
            jbdUtils.showLoginNotice();
        }
    }

    /**
     * Initialize an event that when the button with class accordionCollapse is clicked then the search filter will be
     * collapsed or shown
     */
    collapseSearchFilter() {
        //searchFilter collapse
        let headers = ["H1", "H2", "H3", "H4", "H5", "H6"];

        jQuery(".accordionCollapse").click(function (e) {
            let target = e.target,
                name = target.nodeName.toUpperCase();

            if (jQuery.inArray(name, headers) > -1) {
                let subItem = jQuery(target).next();

                //slideUp all elements (except target) at current depth or greater
                let depth = jQuery(subItem).parents().length;
                let allAtDepth = jQuery(".accordion li, .accordion div").filter(function () {
                    if (jQuery(this).parents().length >= depth && this !== subItem.get(0)) {
                        return true;
                    }
                });
                jQuery(allAtDepth).slideUp("fast");

                //slideToggle target content and adjust bottom border if necessary
                subItem.slideToggle("fast", function () {
                    jQuery(".accordionCollapse :visible:last").css("border-radius", "0 0 10px 10px");
                });
                jQuery(target).css({"border-bottom-right-radius": "0", "border-bottom-left-radius": "0"});
            }
        });
    }

    /**
     * Delete listing on front end CP
     *
     * @param id int id of the company
     */
    deleteDirListing(id) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_COMPANIES_CONFIRM_DELETE'))) {
            jQuery("#cid").val(id);
            jQuery("#task").val("managecompanies.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Delete message on front end CP
     *
     * @param id int ID of the message
     */
    deleteMessage(id) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_COMPANY_MESSAGE_CONFIRM_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val("managemessages.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Add Service on front end CP
     */
    addService() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyservice.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete Service on front end CP
     *
     * @param serviceId int service ID
     */
    deleteService(serviceId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_COMPANY_SERVICE_CONFIRM_DELETE"))) {
            jQuery("#id").val(serviceId);
            jQuery("#task").val("managecompanyservices.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Duplicate Service on front end CP
     *
     * @param serviceId int service id
     */
    duplicateService(serviceId) {
        jQuery("#id").val(serviceId);
        jQuery("#task").val("managecompanyservice.duplicate");
        jQuery("#adminForm").submit();
    }

    /**
     * Submits form on service provider selection
     */
    selectServiceProviders() {
        jQuery("#adminForm").submit();
    }

    /**
     * Add new service provider on front end CP
     */
    addServiceProvider() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyserviceprovider.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete Service Provider on front end CP
     *
     * @param serviceId int service ID
     */
    deleteServiceProvider(serviceId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_COMPANY_SERVICE_PROVIDER_CONFIRM_DELETE"))) {
            jQuery("#id").val(serviceId);
            jQuery("#task").val("managecompanyserviceproviders.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Submits on reservation selection
     */
    selectReservation() {
        jQuery("#adminForm").submit();
    }

    /**
     * Delete reservation on front end CP
     *
     * @param bookingId int booking ID
     */
    deleteReservation(bookingId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_SERVICE_RESERVATION_CONFIRM_DELETE"))) {
            jQuery("#id").val(bookingId);
            jQuery("#task").val("managecompanyservicereservations.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Edit project on front end CP
     *
     * @param projectId int project id
     */
    editProject(projectId) {
        jQuery("#id").val(projectId);
        jQuery("#task").val("managecompanyproject.edit");
        jQuery("#adminForm").submit();
    }

    /**
     * Add new project on front end CP
     */
    addProject() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyproject.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete project on front end CP
     *
     * @param projectId int project ID
     */
    deleteProject(projectId) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_PROJECT_CONFIRM_DELETE'))) {
            jQuery("#id").val(projectId);
            jQuery("#task").val("managecompanyprojects.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Retrieve the project details with ajax and display them
     *
     * @param project int project ID
     */
    showProjectDetail(project) {
        let self = this;
        let baseUrl = jbdUtils.getAjaxUrl('getProjectDetailsAjax', 'companies');
        jQuery.ajax({
            type: "GET",
            url: baseUrl,
            data: {projectId: project},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#project-name').html(data.name);
                jQuery('#project-name-link').html(data.breadCrumbsName);
                jQuery('#project-description').html(data.description);
                jQuery('#project-gallery').html(data.projectGalleryImages);
                if (data.nrPhotos === 0) {
                    jQuery('#project-image-container').css("display", "none");
                } else {
                    jQuery('#project-image-container').css("display", "");
                }
                jQuery("#company-projects-container").hide(500);
                jQuery("#project-details").show(500);
                self.applyLighSlider();
            }
        });
    }

    /**
     * Apply unitegallery after 2 seconds
     */
    applyLighSlider() {
        setTimeout(function () {
            jQuery('#projectImageGallery').unitegallery({
                gallery_theme: "default",
                gallery_height: 550,
                theme_enable_text_panel: true,
                slider_control_zoom: false,
                slider_enable_zoom_panel: false,
                thumb_fixed_size: false
            });
        }, 2000);
    }

    /**
     * Return to projects on business details
     */
    returnToProjects() {
        jQuery("#project-details").hide(500);
        jQuery("#company-projects-container").show(500);
    }

    /**
     * Update company rate with ajax
     *
     * @param companyId int company ID
     * @param rateScore double rate score
     */
    updateCompanyRate(companyId, rateScore) {
        let postParameters = "";
        let ratingId = this.getRatingId(companyId);
        if (typeof ratingId === 'undefined') {
            ratingId = 0;
        }
        postParameters += "&companyId=" + companyId;
        postParameters += "&rating=" + rateScore;
        postParameters += "&ratingId=" + ratingId;

        let postData = '&task=companies.updateRating' + postParameters;
        jQuery.post(jbdUtils.baseUrl, postData, this.processRateResult);
    }

    /**
     * Process response from updateCompanyRate function
     *
     * @param response object response
     */
    processRateResult(response) {
        let self = this;
        let xml = response;

        jQuery(xml).find('answer').each(
            function () {
                jQuery("#rateNumber" + jQuery(this).attr('id')).html(
                    jQuery(this).attr('nrRatings'));
                jQuery("#rateNumber" + jQuery(this).attr('id'))
                    .parent().show();
                jQuery('#rating-average').rating('update', jQuery(this).attr('averageRating'));
                self.saveCookieRating(jQuery(this).attr('id'), jQuery(this).attr('ratingId'));
            });
    }

    /**
     * Retrieve rating id from cookie
     *
     * @param companyId int company ID
     * @returns {string}
     */
    getRatingId(companyId) {
        let ratings = jbdUtils.getCookie("companyRatingIds");
        if (typeof ratings === 'undefined') {
            return;
        }

        let ratingsIds = ratings.split('#');
        for (let i = 0; i < ratingsIds.length; i++) {
            let temp = ratingsIds[i].split(',');
            if (temp[0] == companyId)
                return temp[1];
        }
    }

    /**
     * Save cookie for rating of the company. So the same pc dont rate twice
     *
     * @param companyId int company ID
     * @param reviewId int review ID
     */
    saveCookieRating(companyId, reviewId) {
        let ratings = jbdUtils.getCookie("companyRatingIds");
        if (ratings == undefined)
            ratings = companyId + ',' + reviewId + '#';

        let ratingsIds = ratings.split('#');
        let found = false;
        for (let i = 0; i < ratingsIds.length; i++) {
            let temp = ratingsIds[i].split(',');
            if (temp[0] == companyId)
                found = true;
        }
        if (!found) {
            ratings = ratings + companyId + ',' + reviewId + '#';
        }
        jbdUtils.setCookie("companyRatingIds", ratings, 60);
    }

    /**
     * Display product categories
     *
     * @param parentId int parent ID
     */
    showProductCategories(parentId) {
        jQuery('.categories-level-1').hide(500);
        jQuery('.categories-level-' + parentId).show(500);
        let parent = jQuery('#parent-category-' + parentId + ' .post-title').text();
        parent = parent + ' - ' + Joomla.JText._('LNG_SUBCATEGORIES');
        jQuery('#sub-categories').html('<a href="javascript:void(0);" onclick="this.showProductCategories(' + parentId + ')">' + parent + '</a>&raquo;');
        jQuery('#category-products').empty();
        jQuery('#product-details').empty();
        jQuery('#product-details-content').empty();
        jQuery('#product-list-content').empty();
    }

    /**
     * Go back to all categories on products section on company details
     */
    goBack() {
        jQuery('.grid4').hide(500);
        jQuery('.categories-level-1').show(500);
        jQuery('#sub-categories').empty();
        jQuery('#category-products').empty();
        jQuery('#product-details').empty();
        jQuery('#product-details-content').empty();
        jQuery('#product-list-content').empty();
    }

    /**
     * Show products after selecting a category on company details
     *
     * @param catId int category ID
     * @param companyId int company ID
     */
    showProducts(catId, companyId) {
        jQuery('.categories-level-1').hide(500);
        jQuery('.grid4').hide(500);
        jQuery('#product-list-content').html('<p id="remove-image-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span> Loading...</p>').load(jbdUtils.getProperty("url") + '&view=companyproducts #grid-content', {
            categoryId: catId,
            companyId: companyId
        }, function () {
            let categoryName = jQuery('#product-category h1').text();
            jQuery('#category-products').html('<a href="javascript:void(0);" onclick="jbdListings.goBackToProducts(' + catId + ', ' + companyId + ')">' + categoryName + '</a>&raquo;');
        });
        jQuery('#company-products-title').text(Joomla.JText._('LNG_PRODUCTS'));
        jQuery('#product-list-content').attr('style', 'display: block;');
        jQuery('#category-products').empty();
        jQuery('#product-details').empty();
        jQuery('#product-details-content').empty();
    }

    /**
     * Open quote modal for product on company details
     *
     * @param companyId int company ID
     */
    showQuoteCompanyProduct(companyId) {
        var path_part1 = jQuery("#all-categories-path").text();
        var path_part2 = jQuery("#sub-categories").text();
        var path_part3 = jQuery("#category-products").text();
        var path_part4 = jQuery("#product-details").text();

        var path = path_part1;
        if (path_part2!=''){
            path += ' -> '+path_part2;
            if(path_part3 != ''){
                path += ' -> '+path_part3;
                if (path_part4 != ''){
                    path += ' -> '+path_part4;
                }
            }
        }

        jQuery("#company-quote-product #path").val(path);
        jQuery("#company-quote-product #companyId").val(companyId);
        jQuery('#company-quote-product').jbdModal();
    }

    /**
     * Request Quote for product on company details page
     *
     * @param baseurl url of the path where quote is placed
     */
    requestQuoteCompanyProduct(baseurl) {
        var isError = jQuery("#quoteCompanyProductFrm").validationEngine('validate');
        if (!isError)
            return;

        var postData = "";
        postData += "&firstName=" + jQuery("#company-quote-product #firstName-quote").val();
        postData += "&lastName=" + jQuery("#company-quote-product #lastName-quote").val();
        postData += "&email=" + jQuery("#company-quote-product #email-quote").val();
        postData += "&description=" + jQuery("#company-quote-product #description-quote").val();
        postData += "&companyId=" + jQuery("#company-quote-product #companyId").val();
        var productId = jQuery("#company-quote-product #productId").val();
        if (productId != '') {
            postData += "&productId=" + productId;
        }else{
            postData += "&productId=0";
        }
        var productAlias = jQuery("#company-quote-product #productAlias").val();
        if (productAlias != '') {
            postData += "&productAlias=" + productAlias;
        }else{
            postData += "&productAlias=0";
        }
        var productSubject = jQuery("#company-quote-product #productSubject").val();
        if (productSubject != '') {
            postData += "&productSubject=" + productSubject;
        }else{
            postData += "&productSubject=0";
        }
        postData += "&path=" + jQuery("#company-quote-product #path").val();
        postData += "&recaptcha_response_field=" + jQuery("#company-quote-product #recaptcha_response_field").val();
        postData += "&g-recaptcha-response=" + jQuery("#company-quote-product #g-recaptcha-response-1").val();

        jQuery.post(baseurl, postData, this.processContactCompanyResult);
    }

    /**
     * Handle the response from requestQuoteCompanyProduct function
     *
     * @param response object response
     */
    processQuoteCompanyResult(response) {
        var xml = response;
        jQuery(xml).find('answer').each(function () {
            jQuery(".quote-submit-button").removeClass("loader");
            
            let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('COM_JBUSINESS_ERROR') +'</p>'
			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div> <div class="jmodal-body"><p>' +jQuery(this).attr('errorMessage') + '</p></div> </div></div>';
            
            jQuery(html).appendTo('body').jbdModal();
            setTimeout(function () {
                jQuery.jbdModal.close()
            }, 2000);
            
        });
    }

    /**
     * Get back to categories on products section
     *
     * @param catId int cateogry ID
     */
    goBackToCategories(catId) {
        jQuery('#product-list-content').empty();
        jQuery('#subcategory-' + catId).closest('.grid4').show(500);
        jQuery('#company-products-title').text(Joomla.JText._('LNG_PRODUCT_CATEGORIES'));
    }

    /**
     * Open the product details on front end section on company detail view
     *
     * @param productId int product id
     * @param catId int category ID
     * @param companyId int company ID
     * @param productAlias string product alias
     * @param productSubject string product subject
     */
    showProductDetails(productId, catId, companyId, productAlias, productSubject) {
        jQuery('#product-list-content').hide(500);
        jQuery('#product-details-content').html('<p id="remove-image-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span> Loading...</p>').load(jbdUtils.getProperty("url") + '&view=companyproducts #product-details', {
            productId: productId,
            categoryId: catId
        }, function () {
            let productName = jQuery('#product-name h2').text();
            jQuery('#product-details').html('<a style="color:black;">' + productName + '</a>');
            jQuery("#company-quote-product #productId").val(productId);
            jQuery("#company-quote-product #productAlias").val(productAlias);
            jQuery("#company-quote-product #productSubject").val(productSubject);
            jQuery('#product-quote-request').html();
            jQuery('#product-quote-request').html('<a href="javascript:void(0);" class="btn btn-primary" style="float: right" onclick="jbdListings.showQuoteCompanyProduct('+companyId+')">'+Joomla.JText._('LNG_QUOTE')+'</a>');
        });
        jQuery('#company-products-title').text(Joomla.JText._('LNG_PRODUCT_DETAILS'));
        jQuery('#product-details-content').show(500);
    }

    /**
     * Go back to product section
     *
     * @param catId int category ID
     * @param companyId int company ID
     */
    goBackToProducts(catId, companyId) {
        jQuery('#product-details-content').hide(500);
        jQuery('#product-details-content').empty();
        this.showProducts(catId, companyId);
        jQuery('#product-list-content').show(500);
        jQuery('#product-list-content').attr('style', 'display: block;');
    }
}

let jbdListings = new JBDListings();;/**
 * JBD Offers javascript class
 */
class JBDOffers {

    /**-- ADMNIN FUNCTIONS --**/

    /**
     * Add the dates to the form fields to save them on item save
     */
    saveDates() {
        let start_time = jQuery('#publish_start_time').val();
        let end_time = jQuery('#publish_end_time').val();

        if (start_time == '') {
            jQuery('#start_time').attr('value', '');
        }
        if (end_time == '') {
            jQuery('#end_time').attr('value', '');
        }
    }

    /**
     * Update the attributes on category selection. If linking of categories and attributes is enabled then the attributes
     * will be shown based on the category selection for the item
     *
     * @param categoryId int category id
     * @param offerId int offer id
     */
    updateAttributes(categoryId, offerId) {
        let attributesUrl = jbdUtils.getAjaxUrl('getAttributesAjax', 'offer', 'managecompanyoffer');

        jQuery.ajax({
            type: "GET",
            url: attributesUrl,
            data: {categoryId: categoryId, offerId: offerId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#customFieldsContent').html(data);
                jQuery(".chosen-select").chosen({width: "95%", disable_search_threshold: 5, search_contains: true});
            }
        });
    }

    /**
     * Update the offer selling options on category selection. If linking of categories and attributes is enabled then the options
     * will be shown based on the category selection for the item
     *
     * @param categoryId int category id
     * @param offerId int offer id
     */
    updateSellingOptionsAjax(categoryId, offerId){
        let attributesUrl = jbdUtils.getAjaxUrl('getSellingOptionsAjax', 'offer', 'managecompanyoffer');

        jQuery.ajax({
            type: "GET",
            url: attributesUrl,
            data: {categoryId: categoryId, offerId: offerId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data == null) {
                    jQuery('#defaultQuantity').show();
                    jQuery('#noAttributesExplain').show();
                    jQuery('#customOptionsContent').hide();
                } else {
                    jQuery('#customOptionsContent').show();
                    jQuery('#noAttributesExplain').hide();
                    jQuery('#defaultQuantity').hide();
                }
                jQuery('#customOptionsContent').html(data);
            }
        });
    }

    updateQuantity(currentValue, offerId, $mainCatId) {
        let url = jbdUtils.getAjaxUrl('updateQuantityAjax', 'offer', 'offer');

        let attrVal = {};
        let newValue = jQuery('.jbtn-order-info').find(':input').first().val();
        let oldVal =  jQuery('#firstValue').val();
        jQuery('.jbtn-order-info').find(':input').each(function () {
            if (this.type == 'select-one' && this.name != 'quantity') {
                attrVal[this.id] = jQuery(this).val();
            } else if (this.type == 'select-one' && this.name == 'quantity') {
                jQuery("#quantity" + " option").each(function () {
                    if (jQuery(this).val() != '0') {
                        jQuery(this).hide();
                    }
                });
            }
        });

        jQuery.ajax({
            type: "GET",
            url: url,
            data: {selectedValues: attrVal, offerId: offerId, mainCatId: $mainCatId, oldVal: oldVal, newValue: newValue},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('.jbtn-order-info').html('');
                jQuery('.jbtn-order-info').html(data);
            }
        });

        jbdOffers.checkAddToCartStatus();
    }

    /**
     * Shows price base on the offer
     *
     * @param div string div name
     * @param link string link name
     */
    showPriceBase(div, link) {
        jQuery("#" + link).css("display", "none");
        jQuery("#" + div).removeAttr("style");
    }

    /**
     * Show less price Base
     *
     * @param div string div name
     * @param link string link name
     */
    lessPriceBase(div, link) {
        jQuery("#" + div).css("display", "none");
        jQuery("#" + link).removeAttr("style");
    }

    /**
     * Load item address based on the address of the listing associated with it.
     *
     * @param limit boolean true or false if limit cities and regions is set on general settings
     */
    loadAddress(limit) {
        let companyId = jQuery('select#companyId option:selected').val();
        if (companyId == '') {
            alert(Joomla.JText._("LNG_MISSING_OFFER_COMPANY"));
            return;
        }

        let offerUrl = jbdUtils.getAjaxUrl('getListingAddressAjax', 'offer', 'managecompanyoffer');

        jQuery.ajax({
            type: "GET",
            url: offerUrl,
            data: {companyId: companyId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data == null) {
                    alert(Joomla.JText._("LNG_MISSING_DELETED_COMPANY"));
                } else {
                    jQuery('#route').val(data.address);
                    jQuery('#street_number').val(data.street_number);
                    jQuery('#area_id').val(data.area);
                    jQuery('#administrative_area_level_2').val(data.province);
                    jQuery('#postal_code').val(data.postalCode);
                    jQuery('#latitude').val(data.latitude);
                    jQuery('#longitude').val(data.longitude);

                    jQuery('#country').val(data.countryId);
                    if (limit) {
                        updateRegions(function () {
                            jQuery('#administrative_area_level_1').val(data.county);
                            updateCities(function () {
                                jQuery('#locality').val(data.city);
                            });
                        });
                    } else {
                        jQuery('#administrative_area_level_1').val(data.county);
                        jQuery('#locality').val(data.city);
                    }

                    let params = [];
                    params['map_zoom'] = 15;
                    params['map_latitude'] = data.latitude;
                    params['map_longitude'] = data.longitude;
                    params['latitude'] = data.latitude;
                    params['longitude'] = data.longitude;

                    //TODO obsolete, update
                    //updateMap(params);
                }
            }
        });
    }

    /**-- SITE FUNCTIONS --**/


    checkAddToCartStatus(){
        let enableStatus = true;
        jQuery('.jbtn-order-info').find(':input').each(function() {
            if (this.type == 'select-one'){
                if (jQuery(this).val() == '' || jQuery(this).val() == '0'){
                    enableStatus = false
                }
            }
        });

        if (enableStatus == true){
            jQuery('#addToCartButton').removeAttr('style');
            jQuery('.jbtn-order-btn').removeAttr('style');
        }else{
            jQuery('#addToCartButton').attr('style','pointer-events:none');
            jQuery('.jbtn-order-btn').attr('style','background-color:lightgray');
        }
        
        let count = 0;
        jQuery('.jbtn-order-info').find(':input').each(function() {
            if (this.type == 'select-one' && count == 0){
                jQuery('#firstValue').val(jQuery(this).val());
                count =1;
            }
        });
        
        //update the price based on the quantity
        var unitprice = jQuery("#offer-stock-price").attr("unitprice");
        var qty = jQuery("#quantity").val();
        var totalprice = unitprice * qty;
        jQuery("#total-price").html(totalprice);
        
    }

    /**
     * Reset the cart and add a new offer
     * 
     */
    
    resetCartAndAdd(offerId){
    	let resetCartUrl = jbdUtils.getAjaxUrl('emptyCartAjax', 'cart');

        jQuery.ajax({
            type: "GET",
            url: resetCartUrl,
            dataType: 'json',
            cache:false,
            success: function (data) {
            	 jbdOffers.addToCart(offerId);
            }
        });
    }
    
    /**
     * Checks the quantity selected and add them to cart on front end.
     *
     * @param offerId int offer ID
     */
    addToCart(offerId, qnt=0) {
    	let values = {};
        let quantity = jQuery('#quantity').val();
        
        if(qnt){
        	quantity = qnt;
        	values["quantity"] = qnt;
        }

        
        jQuery('.jbtn-order-info').find(':input').each(function() {
            if (this.type == 'select-one'){
                values[this.id] = jQuery(this).val();
            }
        });

        let urlAddToCart = jbdUtils.getAjaxUrl('addToCartAjax', 'cart');
        if (quantity == 0) {
            alert(Joomla.JText._('LNG_PLEASE_SELECT_QUANTITY'));
            return;
        }

        let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + Joomla.JText._('LNG_ADDING_PRODUCT_TO_SHOPPING_CART') +'</p>'
        			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div></div></div>';
        
        
        jQuery(html).appendTo('body').jbdModal();

        jQuery.ajax({
            type: "GET",
            url: urlAddToCart,
            data: {offerId: offerId, selectedData: values},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery.jbdModal.close();
                let count = 0;

                jbdOffers.checkAddToCartStatus();
                if(data === true){
                	jQuery('#cart-dialog').jbdModal();
                	jQuery('.jbtn-order-info').find(':input').each(function() {
                        if (this.type == 'select-one') {
                            if (count == 0) {
                                if (this.name == 'quantity'){
                                    jQuery(this).val('0');
                                }else {
                                    jQuery(this).val("");
                                    jQuery(this).trigger("change");
                                }
                                count = 1;
                            }
                        }
                    });
                }else{
                	jQuery('#cart-error').jbdModal();	
                }
                
            }
        });
    }

    /**
     * Render Offer Rating Criteria on Front End On Review Section
     *
     * @param imagePath string image path
     */
    renderOfferRatingCriteria(imagePath) {
        jQuery('.rating-criteria').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            starCaptions: {
                0.5: Joomla.JText._('LNG_BAD'),
                1: Joomla.JText._('LNG_BAD'),
                1.5: Joomla.JText._('LNG_POOR'),
                2: Joomla.JText._('LNG_POOR'),
                2.5: Joomla.JText._('LNG_REGULAR'),
                3: Joomla.JText._('LNG_REGULAR'),
                3.5: Joomla.JText._('LNG_GOOD'),
                4: Joomla.JText._('LNG_GOOD'),
                4.5: Joomla.JText._('LNG_GORGEOUS'),
                5: Joomla.JText._('LNG_GORGEOUS')
            },
            size: 'sm',
            showCaption: true,
            starCaptionClasses: {
                0.5: 'badge badge-danger',
                1: 'badge badge-danger',
                1.5: 'badge badge-warning',
                2: 'badge badge-warning',
                2.5: 'badge badge-info',
                3: 'badge badge-info',
                3.5: 'badge badge-primary',
                4: 'badge badge-primary',
                4.5: 'badge badge-success',
                5: 'badge badge-success'
            },
            clearCaption: Joomla.JText._('LNG_NOT_RATED_YET'),
            clearCaptionClass: 'badge badge-default',
            hoverEnabled: true,
            hoverChangeCaption: true,
            hoverChangeStars: true,
            rtl: false,
        });

        jQuery('.rating-criteria').on('rating:change', function (event, value, caption) {
            jQuery(this).parent().parent().parent().children("input").val(value);
        });

        jQuery('.rating-criteria').on('rating:clear', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });

        jQuery('.rating-criteria').on('rating:reset', function (event) {
            jQuery(this).parent().parent().parent().children("input").val(0);
        });
    }

    /**
     * Render offer Reviews
     */
    renderOfferReviews() {
        jQuery('.rating-review').rating({
            min: 0,
            max: 5,
            step: 0.5,
            stars: 5,
            size: 'sm',
            showCaption: false,
            rtl: false,
            displayOnly: true,
        });

        jQuery('.rating-review').each(function () {
            jQuery(this).rating('update', this.title);
        });
    }

    /**
     * Show list mode on offers
     */
    showList() {
        jQuery("#offer-list-view").show();
        jQuery("#layout").hide();

        jQuery("#grid-view-link").removeClass("active");
        jQuery("#list-view-link").addClass("active");
    }

    /**
     * Show offers on grid mode
     */
    showGrid() {
        jQuery("#offer-list-view").hide();
        jQuery("#layout").show();

        jQuery("#grid-view-link").addClass("active");
        jQuery("#list-view-link").removeClass("active");
    }

    /**
     * Edit offer on front end CP
     *
     * @param offerId int offer ID
     */
    editOffer(offerId) {
        jQuery("#id").val(offerId);
        jQuery("#task").val("managecompanyoffer.edit");
        jQuery("#adminForm").submit();
    }

    /**
     * Add new offer on front end CP
     */
    addOffer() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyoffer.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete an offer on front end CP
     *
     * @param offerId int offer ID
     */
    deleteOffer(offerId) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_OFFERS_CONFIRM_DELETE'))) {
            jQuery("#id").val(offerId);
            jQuery("#task").val("managecompanyoffers.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Delete offer order on front end CP
     *
     * @param orderId int Order ID
     */
    deleteOrder(orderId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_OFFER_ORDER_CONFIRM_DELETE"))) {
            jQuery("#id").val(orderId);
            jQuery("#task").val("managecompanyofferorders.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Delete Offer Coupon on front end CP
     *
     * @param couponId int coupon ID
     */
    deleteCoupon(couponId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_COUPONS_CONFIRM_DELETE", true))) {
            jQuery("#id").val(couponId);
            jQuery("#task").val("managecompanyoffercoupons.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Delete offer message on front end CP
     *
     * @param id int Offer message ID
     */
    deleteOfferMessage(id) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_OFFER_MESSAGE_CONFIRM_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val("manageoffermessages.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Show/hide the stock configuration section
     * 
     */
    displayOfferSelling(show) {
        if (show == 0) {
            jQuery('#offerSellingOptions').hide();
        }
        if (show == 1){
            jQuery('#offerSellingOptions').show();
        }
    }
    
    /**
     * Show/hide the stock configuration section
     * 
     */
    displayStockPrice(showHide = 0) {
        if (showHide == 0) {
            jQuery('.stock-price').hide();
        }
        
        if (showHide == 1){
            jQuery('.stock-price').show();
        }
    }

}

let jbdOffers = new JBDOffers();;/**
 * JBD Events javascript class
 */
class JBDEvents {
    /**-- ADMNIN FUNCTIONS --**/

    /**
     * Shows modal for recurring events on event save
     *
     * @param task string name of the event
     */
    showSaveDialog(task) {
        jQuery("#task").val(task);
        jQuery('#edit-event-dialog').jbdModal();
    }

    /**
     * Do not create recurring events and hide the options for recurring events
     */
    repeatNone() {
        jQuery("#repeat-options").hide();
    }

    /**
     * Shows recurring event options for daily repeats.
     */
    repeatDaily() {
        console.debug("repeat daily");
        jQuery("#repeat-options").show();
        jQuery("#week-days-group").hide();
        jQuery("#monthly-repeat").hide();
    }

    /**
     * Shows recurring event options for weekly repeats.
     */
    repeatWeekly() {
        jQuery("").hide();
        jQuery("#repeat-options").show();
        jQuery("#week-days-group").show();
        jQuery("#monthly-repeat").hide();
    }

    /**
     * Shows recurring event options for monthly repeats.
     */
    repeatMonthly() {
        jQuery("#repeat-options").show();
        jQuery("#week-days-group").hide();
        jQuery("#monthly-repeat").show();
    }

    /**
     * Shows recurring event options for yearly repeats.
     */
    repeatYearly() {
        jQuery("#repeat-options").show();
        jQuery("#week-days-group").hide();
        jQuery("#monthly-repeat").hide();
    }

    /**
     * Enable recurring event options for the occurrences of the event and disable the end date of the recurring
     */
    endsOnOccurances() {
        jQuery("#rend_date").prop('disabled', true);
        jQuery("#occurrences").prop('disabled', false);
    }

    /**
     * Enable recurring event options for the end date of the recurring and disable the occurrences of the event
     */
    endsOnDate() {
        jQuery("#rend_date").prop('disabled', false);
        jQuery("#occurrences").prop('disabled', true);
    }

    /**
     * Edit only current event on the series of recurring events
     */
    editCurrentEvent() {
        jQuery("#edit_mode").val(1);
        Joomla.submitform(jQuery("#task").val(), document.getElementById('item-form'));
        jQuery.jbdModal.close();
    }

    /**
     * Edit only the following events on the series of recurring events
     */
    editAllFollowignEvents() {
        jQuery("#edit_mode").val(2);
        Joomla.submitform(jQuery("#task").val(), document.getElementById('item-form'));
        jQuery.jbdModal.close();
    }

    /**
     * Edit all events on the series of recurring events
     */
    editAllSeriesEvents() {
        jQuery("#edit_mode").val(3);
        Joomla.submitform(jQuery("#task").val(), document.getElementById('item-form'));
        jQuery.jbdModal.close();
    }

    /**
     * Add the dates to the form fields to save them on event save
     */
    saveDates() {
        let start_time = jQuery('#start_time').val();
        let end_time = jQuery('#end_time').val();
        let doors_open_time = jQuery('#doors_open_time').val();
        let booking_open_time = jQuery('#booking_open_time').val();
        let booking_close_time = jQuery('#booking_close_time').val();

        if (start_time == '')
            jQuery('#start_time').attr('value', '');
        if (end_time == '')
            jQuery('#end_time').attr('value', '');
        if (doors_open_time == '')
            jQuery('#doors_open_time').attr('value', '');
        if (booking_open_time == '')
            jQuery('#booking_open_time').attr('value', '');
        if (booking_close_time == '')
            jQuery('#booking_close_time').attr('value', '');
    }

    /**
     * Update the attributes on category selection. If linking of categories and attributes is enabled then the attributes
     * will be shown based on the category selection for the item
     *
     * @param categoryId int category id
     * @param eventId int event id
     */
    updateAttributes(categoryId, eventId) {
        let attributesUrl = jbdUtils.getAjaxUrl('getAttributesAjax', 'event', 'managecompanyevent');

        jQuery.ajax({
            type: "GET",
            url: attributesUrl,
            data: {categoryId: categoryId, eventId: eventId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                jQuery('#customFieldsContent').html(data);
                jQuery(".chosen-select").chosen({width: "95%", disable_search_threshold: 5, search_contains: true});
            }
        });
    }

    /**
     * Load item address based on the address of the listing associated with it.
     *
     * @param limit boolean true or false if limit cities and regions is set on general settings
     */
    loadAddress(limit) {
        let companyId = jQuery('select#company_id option:selected').val();
        if (companyId == '') {
            alert(Joomla.JText._("LNG_MISSING_EVENT_COMPANY"));
            return;
        }

        let eventUrl = jbdUtils.getAjaxUrl('getListingAddressAjax', 'event', 'managecompanyevent');

        jQuery.ajax({
            type: "GET",
            url: eventUrl,
            data: {companyId: companyId},
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data == null) {
                    alert(Joomla.JText._("LNG_MISSING_DELETED_COMPANY"));
                } else {
                    jQuery('#route').val(data.address);
                    jQuery('#street_number').val(data.street_number);
                    jQuery('#area_id').val(data.area);
                    jQuery('#administrative_area_level_2').val(data.province);
                    jQuery('#postal_code').val(data.postalCode);
                    jQuery('#latitude').val(data.latitude);
                    jQuery('#longitude').val(data.longitude);

                    jQuery('#country').val(data.countryId);
                    if (limit) {
                        updateRegions(function () {
                            jQuery('#administrative_area_level_1').val(data.county);
                            updateCities(function () {
                                jQuery('#locality').val(data.city);
                            });
                        });
                    } else {
                        jQuery('#administrative_area_level_1').val(data.county);
                        jQuery('#locality').val(data.city);
                    }

                    let params = [];
                    params['map_zoom'] = 15;
                    params['map_latitude'] = data.latitude;
                    params['map_longitude'] = data.longitude;
                    params['latitude'] = data.latitude;
                    params['longitude'] = data.longitude;

                    //TODO obsolete, update
                    //updateMap(params);
                }
            }
        });
    }

    /**-- SITE FUNCTIONS --**/

    /**
     * Show join event dialog
     */
    showCompanyListDialog() {
        jQuery('#company-list').jbdModal();
    }

    /**
     * called when needed to join an event and if the user is logged in then show login notice otherwise show join event
     * dialog
     *
     * @param userId int user id
     */
    joinEvent(userId) {
        if (userId == 0) {
            jbdUtils.showLoginNotice();
        } else {
            jbdEvents.showCompanyListDialog();
        }
    }

    /**
     * Join event function. Associates the selected companies with the event.
     *
     * @param event_id int event ID
     */
    associateCompanies(event_id) {
        let urlAssociateCompanies = jbdUtils.getAjaxUrl('associateCompaniesAjax', 'event');

        let eventId = event_id;
        let selectedValues = jQuery('#userAssociatedCompanies').val();
        let companyIds;
        if (Array.isArray(selectedValues)) {
            companyIds = selectedValues.join();
        } else {
            companyIds = -1;
        }

        let successMessage = jQuery('#associated-companies-message').html();

        jQuery.ajax({
            type: "GET",
            url: urlAssociateCompanies,
            data: {companyIds: companyIds, eventId: eventId},
            dataType: 'json',
            cache:false,
            success: function () {
                if (Array.isArray(selectedValues)) {
                    jQuery(successMessage).appendTo('body').jbdModal();
                }
                else {
                    jQuery.jbdModal.close();
                }
            }
        });
    }

    /**
     * Show event in list mode
     *
     * @param view int view
     */
    showEventList(view) {
        jQuery(".event-list-style-1").show();
        jQuery(".event-list-style-2").show();
        jQuery("#grid-layout").hide();
        jQuery(".result-counter").show();
        jQuery(".pagination").show();
        jQuery(".search-toggles .sortby").show();
        jQuery(".search-toggles .orderBy").show();

        jQuery("#grid-view-link").removeClass("active");
        jQuery("#list-view-link").addClass("active");
    }

    /**
     * Show event in grid mode
     *
     * @param hidePagination boolean if set to yes then hide the pagination
     */
    showGrid(hidePagination = false) {
        jQuery(".event-list-style-1").hide();
        jQuery(".event-list-style-2").hide();
        jQuery("#grid-layout").show();

        if (hidePagination) {
            jQuery(".result-counter").hide();
            jQuery(".pagination").hide();
        }
        jQuery(".search-toggles .sortby").hide();
        jQuery(".search-toggles .orderBy").hide();

        if (typeof calendarOptions !== 'undefined') {
            jQuery('#events-calendar').fullCalendar(calendarOptions);
        }

        jQuery("#grid-view-link").addClass("active");
        jQuery("#list-view-link").removeClass("active");
    }

    /**
     * Search events on the dates interval
     *
     * @param startDate string start date of the interval
     * @param endDate string end date of the interval
     */
    setSearchDates(startDate, endDate) {
        jQuery("#adminForm #startDate").val(startDate);
        jQuery("#adminForm #endDate").val(endDate);
        jQuery("#adminForm input[name=limitstart]").val(0);
        jQuery("#adminForm").submit();
    }

    /**
     * Edit event on front end CP
     *
     * @param eventId int event ID that will be edited
     */
    editEvent(eventId) {
        jQuery("#id").val(eventId);
        jQuery("#task").val("managecompanyevent.edit");
        jQuery("#adminForm").submit();
    }

    /**
     * Create new event on front end CP
     */
    addDirEvent() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyevent.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete event on front end CP
     *
     * @param eventId int event ID
     */
    deleteDirEvent(eventId) {
        jQuery("#id").val(eventId);

        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_EVENTS_CONFIRM_DELETE'))) {
            jQuery("#id").val(eventId);
            jQuery("#task").val("managecompanyevents.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Show delete recurring modal.
     */
    showDeleteDialog() {
        jQuery('#delete-event-dialog').jbdModal();
    }

    /**
     * Delete only the current event on the recurring series
     */
    deleteEvent() {
        jQuery("#delete_mode").val(1);
        Joomla.submitform('managecompanyevents.delete');
        jQuery.jbdModal.close();
    }

    /**
     * Delete all the following events on the recurring series
     */
    deleteAllFollowignEvents() {
        jQuery("#delete_mode").val(2);
        Joomla.submitform('managecompanyevents.delete');
        jQuery.jbdModal.close();
    }

    /**
     * Delete all events on the recurring series
     */
    deleteAllSeriesEvents() {
        jQuery("#delete_mode").val(3);
        Joomla.submitform('managecompanyevents.delete');
        jQuery.jbdModal.close();
    }

    /**
     * Submit form after select an appointment
     */
    selectAppointment() {
        jQuery("#adminForm").submit();
    }

    /**
     * Delete appointment by it ID.
     *
     * @param appointmentId int appointment ID
     */
    deleteAppointment(appointmentId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_EVENT_APPOINTMENT_CONFIRM_DELETE"))) {
            jQuery("#id").val(appointmentId);
            jQuery("#task").val("managecompanyeventappointments.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Confirm appointment on front end CP
     *
     * @param appointmentId int appointment ID
     */
    confirmAppointment(appointmentId) {
        jQuery("#id").val(appointmentId);
        jQuery("#task").val("managecompanyeventappointments.confirm");
        jQuery("#adminForm").submit();
    }

    /**
     * Deny appointment on front end CP
     *
     * @param appointmentId int appointment ID
     */
    denyAppointment(appointmentId) {
        jQuery("#id").val(appointmentId);
        jQuery("#task").val("managecompanyeventappointments.deny");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete event Reservation on front end CP
     *
     * @param bookingId int booking ID
     */
    deleteEventReservation(bookingId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_EVENT_RESERVATION_CONFIRM_DELETE"))) {
            jQuery("#id").val(bookingId);
            jQuery("#task").val("managecompanyeventreservations.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Submit form on ticket selection
     */
    selectTicket() {
        jQuery("#adminForm").submit();
    }

    /**
     * Add new event ticket on front end CP
     */
    addEventTicket() {
        jQuery("#id").val(0);
        jQuery("#task").val("managecompanyeventticket.add");
        jQuery("#adminForm").submit();
    }

    /**
     * Delete event ticket on front end CP
     *
     * @param ticketId int ticket ID
     */
    deleteTicket(ticketId) {
        if (confirm(Joomla.JText._("COM_JBUSINESS_DIRECTORY_EVENT_TICKET_CONFIRM_DELETE"))) {
            jQuery("#id").val(ticketId);
            jQuery("#task").val("managecompanyeventtickets.delete");
            jQuery("#adminForm").submit();
        }
    }

    /**
     * Duplicate event ticket on front end CP
     *
     * @param ticketId int ticket ID
     */
    duplicateTicket(ticketId) {
        jQuery("#id").val(ticketId);
        jQuery("#task").val("managecompanyeventticket.duplicate");
        jQuery("#adminForm").submit();
    }

    /**
     * delete event message by its ID on front end CP
     *
     * @param id int message ID
     */
    deleteEventMessage(id) {
        if (confirm(Joomla.JText._('COM_JBUSINESS_DIRECTORY_EVENT_MESSAGE_CONFIRM_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val("manageeventmessages.delete");
            jQuery("#adminForm").submit();
        }
    }
}

let jbdEvents = new JBDEvents();;/**
 * JBD Review javascript class
 */
class JBDReviews {

    /**
     * Validate form and Save Review based on the form ID passed to the function
     * @param formId
     */
    saveReview(formId) {
        var form_id = '#' + formId;
        var isError = jQuery(form_id).validationEngine('validate');
        if (!isError) {
            return;
        }

        document.getElementById(formId).submit();
    }

    /**
     * Cancel add review and hide the new review section
     */
    cancelSubmitReview() {
        jQuery("#add-review").slideUp(500);
    }

    /**
     * If user is required to login and he is not logged in then show login Notice otherwise open the review section
     * and slide down to it
     *
     * @param requiresLogin boolean true or false if it is needed to be logged in to let a review
     * @param companyView boolean true or false if it is on company view
     */
    addNewReview(requiresLogin, companyView) {
        companyView = typeof companyView !== 'undefined' ? companyView : true;
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            if (companyView == true) {
                jbdListings.showDetails('company-reviews');
            }
            window.location.hash = '#reviews';
            jQuery("#add-review").slideDown(500);
        }
    }

    /**
     * If user is required to login and he is not logged in then show login Notice otherwise open the review section
     * and slide down to it
     * This function is done for tabs form view
     *
     * @param requiresLogin boolean true or false if it is needed to be logged in to let a review
     */
    addNewReviewOnTabs(requiresLogin) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            jbdListings.showDirTab("#tabs-3");
            window.location.hash = '#reviews';
            jQuery("#add-review").slideDown(500);
            jbdListings.showTabContent("company-reviews");
        }
    }

    /**
     * Report review abuse
     *
     * @param requiresLogin boolean if true check if it is needed that user should be logged in to let a review abuse
     * @param reviewId int review ID
     */
    reportReviewAbuse(requiresLogin, reviewId) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            var form = document.getElementById('reportAbuse');
            form.elements["reviewId"].value = reviewId;
            jQuery('#report-abuse').jbdModal();
        }
    }

    /**
     * Respond to a review
     *
     * @param requiresLogin boolean if true check if it is needed that user should be logged in to let a review response
     * @param reviewId int review ID
     */
    respondToReview(requiresLogin, reviewId) {
        if (requiresLogin) {
            jbdUtils.showLoginNotice();
        } else {
            var form = document.reviewResponseFrm;
            form.elements["reviewId"].value = reviewId;
            jQuery('#new-review-response').jbdModal();
        }
    }

    /**
     * Validates review abuse and submit the form
     */
    saveReviewAbuse() {
        if (!this.validateReportAbuseForm()) {
            return;
        }

        var form = document.reportAbuse;
        form.submit();
    }

    /**
     * Validates review response and submit the form
     */
    saveReviewResponse() {
        if (!this.validateReviewResponseForm()) {
            return;
        }
        var form = document.reviewResponseFrm;
        form.submit();
    }

    /**
     * Close the Modal
     */
    closeDialog() {
        jQuery.jbdModal.close();
    }

    /**
     * When Like is clicked, increase the listing review like count statistic
     *
     * @param reviewId int review ID
     */
    increaseReviewLikeCount(reviewId) {
        var postParameters = '';
        postParameters += "&reviewId=" + reviewId;
        var postData = '&task=companies.increaseReviewLikeCountAjax&view=companies' + postParameters;
        jQuery.post(jbdUtils.getProperty('baseUrl'), postData, this.processIncreaseLikeResult);
    }

    /**
     * When Like is clicked, increase the offer review like count statistic
     *
     * @param reviewId int review ID
     */
    increaseOfferReviewLikeCount(reviewId) {
        var postParameters = '';
        postParameters += "&reviewId=" + reviewId;
        var postData = '&task=offer.increaseReviewLikeCountAjax&view=offers' + postParameters;
        jQuery.post(jbdUtils.getProperty('baseUrl'), postData, this.processIncreaseLikeResult);
    }

    /**
     * Handle Review Like Count Response of the function increaseReviewLikeCount and increaseOfferReviewLikeCount
     *
     * @param response object response
     */
    processIncreaseLikeResult(response) {
        var xml = response;
        //alert(xml);
        //jQuery('#frmFacilitiesFormSubmitWait').hide();
        jQuery(xml).find('answer').each(function () {
            if (jQuery(this).attr('result') == true) {
                jQuery("#like" + jQuery(this).attr('reviewId')).text(parseInt(jQuery("#like" + jQuery(this).attr('reviewId')).text()) + 1);
                jbdReviews.saveCookieLikeId(jQuery(this).attr('reviewId'));
                jQuery("#like" + jQuery(this).attr('reviewId')).parent().parent().children().attr('onclick', '');
                jQuery("#like" + jQuery(this).attr('reviewId')).parent().parent().addClass('reduceOpacity');

            } else {
                //alert('notsaved');
            }
        });
    }

    /**
     * Save Like Cookie
     *
     * @param reviewId int review ID
     */
    saveCookieLikeId(reviewId) {
        var ids = jbdUtils.getCookie("likeIds");
        if (typeof ids === 'undefined') {
            ids = '';
        }
        ids += ',' + reviewId;
        jbdUtils.setCookie("likeIds", ids, 60);
        //alert(ids);
    }

    /**
     * Increase Listing Review Dislike Count
     *
     * @param reviewId int review ID
     */
    increaseReviewDislikeCount(reviewId) {
        var postParameters = '';
        postParameters += "&reviewId=" + reviewId;
        var postData = '&task=companies.increaseReviewDislikeCountAjax&view=companies' + postParameters;
        jQuery.post(jbdUtils.getProperty('baseUrl'), postData, this.processIncreaseDislikeResult);
    }

    /**
     * Increase Offer Review Dislike Count
     *
     * @param reviewId int review ID
     */
    increaseOfferReviewDislikeCount(reviewId) {
        var postParameters = '';
        postParameters += "&reviewId=" + reviewId;
        var postData = '&task=offer.increaseReviewDislikeCountAjax&view=offers' + postParameters;
        jQuery.post(jbdUtils.getProperty('baseUrl'), postData, this.processIncreaseDislikeResult);
    }

    /**
     * Process increaseOfferReviewDislikeCount response
     *
     * @param response object response
     */
    processIncreaseDislikeResult(response) {
        var xml = response;
        //alert(xml);
        //jQuery('#frmFacilitiesFormSubmitWait').hide();
        jQuery(xml).find('answer').each(function () {
            if (jQuery(this).attr('result') == true) {
                jQuery("#dislike" + jQuery(this).attr('reviewId')).text(parseInt(jQuery("#dislike" + jQuery(this).attr('reviewId')).text()) + 1);
                jbdReviews.saveCookieDislikeId(jQuery(this).attr('reviewId'));
                jQuery("#dislike" + jQuery(this).attr('reviewId')).parent().parent().children().attr('onclick', '');
                jQuery("#dislike" + jQuery(this).attr('reviewId')).parent().parent().addClass('reduceOpacity');
            } else {
                //alert('notsaved');
            }
        });
    }

    /**
     * Add the dislike cookie
     * @param reviewId int review ID
     */
    saveCookieDislikeId(reviewId) {
        var ids = jbdUtils.getCookie("dislikeIds");
        if (typeof ids === 'undefined') {
            ids = '';
        }

        ids += ',' + reviewId;
        jbdUtils.setCookie("dislikeIds", ids, 60);
    }

    /**
     * Check if the like has been added from the current computer
     */
    checkLikeStatus() {
        var ids = jbdUtils.getCookie("likeIds");
        if (typeof ids === 'undefined') {
            ids = '';
        }

        ids = ids.split(',');

        for (var i = 0; i < ids.length; i++) {
            jQuery("#like" + ids[i]).parent().parent().children('a:first-child').attr('onclick', '');
            jQuery("#like" + ids[i]).parent().parent().addClass('reduceOpacity');
        }
    }

    /**
     * Check if the dislike has been added from the current computer
     */
    checkDislikeStatus() {
        var ids = jbdUtils.getCookie("dislikeIds");
        if (typeof ids === 'undefined') {
            ids = '';
        }

        ids = ids.split(',');
        for (var i = 0; i < ids.length; i++) {
            jQuery("#dislike" + ids[i]).parent().parent().children('a:first-child').attr('onclick', '');
            jQuery("#dislike" + ids[i]).parent().parent().addClass('reduceOpacity');
        }
    }

    /**
     * Validates Report Abuse form before submitting it
     *
     * @returns {boolean}
     */
    validateReportAbuseForm() {
        var form = document.reportAbuse;
        var isError = false;

        jQuery(".error_msg").each(function () {
            jQuery(this).hide();
        });

        if (!validateField(form.elements['email'], 'email', false, null)) {
            jQuery("#reportAbuse #frmEmail_error_msg").show();
            if (!isError) {
                jQuery("#reportAbuse #email").focus();
            }
            isError = true;
        }

        if (!validateField(form.elements['description'], 'string', false, null)) {
            jQuery("#reportAbuse #frmDescription_error_msg").show();
            if (!isError) {
                jQuery("#reportAbuse #frmDescription_error_msg").focus();
            }
            isError = true;
        }

        return !isError;
    }

    /**
     * Validate Review Response Form before submitting it
     *
     * @returns {boolean}
     */
    validateReviewResponseForm() {
        var form = document.reviewResponseFrm;
        var isError = false;

        jQuery(".error_msg").each(function () {
            jQuery(this).hide();
        });

        if (!validateField(form.elements['firstName'], 'string', false, null)) {
            jQuery("#reviewResponseFrm #frmFirstName_error_msg").show();
            if (!isError) {
                jQuery("#firstName").focus();
            }
            isError = true;
        }

        if (!validateField(form.elements['lastName'], 'string', false, null)) {
            jQuery(" #reviewResponseFrm #frmLastName_error_msg").show();
            if (!isError) {
                jQuery("#lastName").focus();
            }
            isError = true;
        }

        if (!validateField(form.elements['email'], 'email', false, null)) {
            jQuery("#reviewResponseFrm #frmEmail_error_msg").show();
            if (!isError) {
                jQuery("#email").focus();
            }
            isError = true;
        }

        if (!validateField(form.elements['response'], 'string', false, null)) {
            jQuery("#reviewResponseFrm #frmDescription_error_msg").show();
            if (!isError) {
                jQuery("#reviewResponseFrm #frmDescription_error_msg").focus();
            }
            isError = true;
        }

        return !isError;
    }

    /**
     * Delete Review for the item offer or listing based on the controller passed
     *
     * @param controller string controller name
     * @param id int Review ID
     */
    deleteReview(controller,id) {
        if (confirm(Joomla.JText._('LNG_ARE_YOU_SURE_YOU_WANT_TO_DELETE'))) {
            jQuery("#id").val(id);
            jQuery("#task").val(controller+".delete");
            jQuery("#adminForm").submit();
        }
    }
}

let jbdReviews = new JBDReviews();

jQuery(document).ready(function () {
    jbdReviews.checkLikeStatus();
    jbdReviews.checkDislikeStatus();
});
	;/**
 * JBD Tabs javascript class
 */
class JBDTabs{

    /**
     * Constructor
     *
     */
	constructor() {
        this.currentTab = 1;
        this.currentTabIndex = 0;
        this.maxTabs = 6;
        this.tabMapInitialized = 0;
    }

    /**
     * Set maximum number of tabs on the page
     *
     * @param maxTabs int number of tabs in the page
     */
    setMaxTabs(maxTabs) {
        this.maxTabs = maxTabs;
    }

    /**
     * Set the number of the preset tabs on the page
     *
     * @param presentTabs int number of tabs
     */
    setPresentTabs(presentTabs) {
        this.presentTabs = presentTabs;
        this.setMaxTabs(presentTabs.length);
    }

    /**
     * Validate the current form and open the tab if everything is validated and is OK
     *
     * @param tab int ID of the tab
     */
    openTab(tab) {
        if (jbdUtils.getProperty("isMultilingual")) {
            jQuery(".tab-" + jbdUtils.getProperty("defaultLang")).each(function () {
                jQuery(this).click();
            });
        }

        jQuery("#item-form").validationEngine('detach');
        if (jbdUtils.getProperty("validateRichTextEditors")) {
            jbdUtils.validateRichTextEditors();
        }

        jbdUtils.validateMultiSelects();
        let validationResult = jQuery("#item-form").validationEngine('validate');

        if (!validationResult) {
            return;
        }

        this.showEditTab(tab);
    }

    /**
     * Open the called tab and hide all the other
     *
     * @param tab int tab name
     */
    showEditTab(tab) {
        jQuery(".edit-tab").each(function () {
            jQuery(this).hide();
        });

        jQuery(".process-step").each(function () {
            jQuery(this).hide();
            jQuery(this).removeClass("active");

        });

        jQuery(".process-tab").each(function () {
            jQuery(this).removeClass("active");
        });

        if (this.currentTabIndex == 0) {
            jQuery("#prev-btn").hide();
        }
        else {
            jQuery("#prev-btn").show();
        }

        if ((this.currentTabIndex + 1) == this.maxTabs) {
            jQuery("#next-btn").hide();
            jQuery("#save-btn").show();
            jQuery("#term_conditions").show();
        }
        else {
            jQuery("#next-btn").show();
            jQuery("#save-btn").hide();
            jQuery("#term_conditions").hide();
        }

        jQuery("#edit-tab" + tab).show();
        jQuery("#step" + tab).show();

        if (tab != 1) {
            let scrollTopOffset = jQuery("#tab" + tab).offset().top - 150;
            jQuery('html,body').animate({scrollTop: scrollTopOffset}, 'slow');
        } else {
            jQuery(window).scrollTop(10);
        }

        jQuery("#step" + tab).addClass("active");
        jQuery("#tab" + tab).addClass("active");
        jQuery("#active-step-number").html(tab);
        if (tab == 3 && this.tabMapInitialized == 0) {
            //TODO global reference
            initializeMap();
            this.tabMapInitialized = 1;
        }
    }

    /**
     * Used on front end when creating a new listing and select next.
     * This function open the next tab
     */
    nextTab() {
        if (jbdUtils.getProperty("isMultilingual")) {
            jQuery(".tab-" + jbdUtils.getProperty("defaultLang")).each(function () {
                jQuery(this).click();
            });
        }

        if (jbdUtils.getProperty("validateRichTextEditors")) {
            jbdUtils.validateRichTextEditors();
        }

        let validationResult = jQuery("#item-form").validationEngine('validate');
        if (validationResult) {
            if (this.currentTabIndex < this.presentTabs.length - 1) {
                this.currentTabIndex++;
                this.currentTab = this.presentTabs[this.currentTabIndex];
            }
            this.showEditTab(this.currentTab);
        }
    }

    /**
     * Used on front end when editing a listing and select previous.
     * This function open the previous tab
     */
    previousTab() {
        if (this.currentTabIndex > 0) {
            this.currentTabIndex--;
            this.currentTab = this.presentTabs[this.currentTabIndex];
        }

        this.showEditTab(this.currentTab);
    }
}

let jbdTabs = new JBDTabs();;/**
 * JBD Upload javascript class
 */
class JBDUpload{

    /**
     * Constructor of the class
     *
     * @param params array params for the initialization of the class
     */
    constructor(params){
        this.setIsBack = false;

        this.folderIDs = [];

    	
        if (typeof params !== 'undefined') {
            if (typeof params['maxAttachments'] !== 'undefined') {
                this.maxAttachments = params['maxAttachments'];
            } else {
                this.maxAttachments = jbdUtils.getProperty("maxAttachments");
            }

            if (typeof params['maxPictures'] !== 'undefined') {
                this.maxPictures = params['maxPictures'];
            }

            if (typeof params['maxVideos'] !== 'undefined') {
                this.maxVideos = params['maxVideos'];
            }

            if (typeof params['removePath'] !== 'undefined') {
                this.removePath = params['removePath'];
            }

            if (typeof params['setIsBack'] !== 'undefined') {
                this.setIsBack = params['setIsBack'];
            }

            if (typeof params['picturesFolder'] !== 'undefined') {
                this.picturesFolder = params['picturesFolder'];
            } else {
                this.picturesFolder = jbdUtils.getProperty("imageBaseUrl");
            }
        } else {
            this.picturesFolder = jbdUtils.getProperty("imageBaseUrl");
            this.maxAttachments = jbdUtils.getProperty("maxAttachments");

            console.log('Upload parameters not defined. Initializing with default params.');
        }
    }

    /**
     * Set is backend because the process is done differently
     */
    setIsBackEnd()
    {
        picturesUploaded = jQuery('input[name*="picture_path[]"]').length;
        this.setIsBack = true;
        this.checkNumberOfPictures();
    }

    /**
     * Set Maximum number of allowed items to be uploaded
     *
     * @param maxAllowedNumber int maximum number of items that can be uploaded
     */
    setMaxPictures(maxAllowedNumber)
    {
        picturesUploaded = jQuery('input[name*="picture_path[]"]').length;
        this.maxPictures = maxAllowedNumber;
        this.checkNumberOfPictures();
    }

    /**
     * Check number of Pictures already uploaded and hide the dropzone if the max number is reached otherwise show it
     */
    checkNumberOfPictures()
    {
        //var nrPictures = jQuery('input[name*="picture_path[]"]').length;
        let nrPictures = jQuery('#pictures-list #sortable li').length;

        if (this.maxPictures <= nrPictures) {
            jQuery("#file-upload").hide();
        } else {
            jQuery("#file-upload").show();
        }
    }

    /**
     * Initiate the image uploader
     *
     * @param folderID string name of the folder where the image will be added
     * @param folderIDPath string url path where also are passed the settings for the image upload
     * @param type string type of the image that is being uploaded. Also control the div where the image will be shown on page
     * @param picId int picture ID
     */
    imageUploader(folderID, folderIDPath, type, picId)
    {
        let typeIndex = typeof type === 'undefined' ? 'default' : type;
        this.folderIDs[typeIndex] = {
            'folderID': folderID,
            'folderIDPath': folderIDPath
        };

        let self = this;

        if (type === undefined || type === null)
            type = '';
        if (picId === undefined || picId === null)
            picId = '';
        jQuery("#" + type + "imageUploader" + picId).change(function () {
            jQuery("#remove-image-loading").remove();
            jQuery("#" + type + "picture-preview" + picId).append('<p id="remove-image-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span> Loading...</p>');
            jQuery("#item-form").validationEngine('detach');
            var fisRe = /^.+\.(jpg|bmp|gif|png|jpeg|PNG|JPG|GIF|JPEG)$/i;
            var path = jQuery(this).val();

            //if empty path stop the upload
            if (!path) {
                return false;
            }

            if (path.search(fisRe) == -1) {
                jQuery("#remove-image-loading").remove();
                alert('JPG, JPEG, BMP, GIF, PNG only!');
                return false;
            }
            jQuery(this).upload(folderIDPath, function (responce) {
                if (responce == '') {
                    jQuery("#remove-image-loading").remove();
                    alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    if (jbdUtils.getProperty("enable_resolution_check")) {
                        var warning = jQuery(xml).find("warning").attr("value");
                        if (typeof warning !== 'undefined') {
                            jQuery("#remove-image-loading").remove();
                            var wHeight = jQuery(xml).find("warning").attr("height");
                            var wWidth = jQuery(xml).find("warning").attr("width");
                            alert(Joomla.JText._("LNG_IMAGE_SIZE_WARNING") + " (Width:" + wWidth + ", Height:" + wHeight + ")");
                            return false;
                        }
                    }

                    jQuery(xml).find("picture").each(function () {
                        if (jQuery(this).attr("error") == 0) {
                            self.setUpImage(
                                folderID + jQuery(this).attr("path"),
                                jQuery(this).attr("name"),
                                type,
                                picId
                            );
                            jQuery("#remove-image-loading").remove();

                            if (jbdUtils.getProperty('enable_crop')) {
                                self.showCropper(self.picturesFolder + folderID + jQuery(this).attr("path"), type, picId);
                            }
                        }
                        else if (jQuery(this).attr("error") == 1)
                            alert(Joomla.JText._("LNG_FILE_ALLREADY_ADDED"));
                        else if (jQuery(this).attr("error") == 2)
                            alert(Joomla.JText._("LNG_ERROR_ADDING_FILE"));
                        else if (jQuery(this).attr("error") == 3)
                            alert(Joomla.JText._("LNG_ERROR_GD_LIBRARY"));
                        else if (jQuery(this).attr("error") == 4)
                            alert(Joomla.JText._("LNG_ERROR_RESIZING_FILE"));
                    });
                }
            });
            jQuery("#item-form").validationEngine('attach');
        });
    }

    /**
     * Sets the image on the image placeholder on the page
     *
     * @param path string image path
     * @param name string image name
     * @param type string image type which is also used to get the id of the section where the image is set
     * @param picId string image id which also is used to get the id of the section where the image is set
     */
    setUpImage(path, name, type, picId)
    {
        jQuery("#"+type+"imageLocation"+picId).val(path);
        let img_new	= document.createElement('img');
        img_new.setAttribute('src', this.picturesFolder + path );
        img_new.setAttribute('id', 'itemImg');
        img_new.setAttribute('class', 'item-image');
        jQuery("#"+type+"picture-preview"+picId).empty();
        jQuery("#"+type+"picture-preview"+picId).append(img_new);
        if (path == '/no_image.jpg'){
            //Reload the page and ignore the browser cache.
            window.location.reload(true);
        }
    }

    /**
     * Initiate the marker upload
     *
     * @param folderID string name of the folder where the image will be added
     * @param folderIDPath string url path where also are passed the settings for the image upload
     */
    markerUploader(folderID, folderIDPath)
    {
        let self = this;

        jQuery("#markerfile").change(function() {
            jQuery("#remove-image-loading").remove();
            jQuery("#marker-preview").append('<p id="remove-image-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span></p>');
            jQuery("#item-form").validationEngine('detach');
            var fisRe 	= /^.+\.(jpg|bmp|gif|png)$/i;
            var path = jQuery(this).val();
            if (path.search(fisRe) == -1) {
                jQuery("#remove-image-loading").remove();
                alert(' JPG, BMP, GIF, PNG only!');
                return false;
            }
            jQuery(this).upload(folderIDPath, function(responce) {
                if( responce == '' ) {
                    jQuery("#remove-image-loading").remove();
                    alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    jQuery(xml).find("picture").each(function() {
                        if(jQuery(this).attr("error") == 0 ) {
                            self.setUpMarker(
                                folderID + jQuery(this).attr("path"),
                                jQuery(this).attr("name")
                            );
                            jQuery("#remove-image-loading").remove();
                        }
                        else if( jQuery(this).attr("error") == 1 )
                            alert(Joomla.JText._('LNG_FILE_ALLREADY_ADDED'));
                        else if( jQuery(this).attr("error") == 2 )
                            alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                        else if( jQuery(this).attr("error") == 3 )
                            alert(Joomla.JText._('LNG_ERROR_GD_LIBRARY'));
                        else if( jQuery(this).attr("error") == 4 )
                            alert(Joomla.JText._('LNG_ERROR_RESIZING_FILE'));
                    });
                }
            });
            jQuery("#item-form").validationEngine('attach');
        });
    }

    /**
     * Sets the image on the image placeholder on the page
     *
     * @param path string image path
     * @param name string image name
     */
    setUpMarker(path, name)
    {
        jQuery("#markerLocation").val(path);
        var img_new	= document.createElement('img');
        img_new.setAttribute('src', this.picturesFolder + path );
        img_new.setAttribute('id', 'markerImg');
        img_new.setAttribute('class', 'marker-image');
        jQuery("#marker-preview").empty();
        jQuery("#marker-preview").append(img_new);
    }

    /**
     * Initiate multi image uploader
     *
     * @param folder string name of the folder where the images will be added
     * @param folderPath string url path where also are passed the settings for the images upload
     */
    multiImageUploader(folder, folderPath)
    {
        let self = this;

        jQuery("#multiImageUploader").change(function() {
            jQuery("#remove-image-loading").remove();
            jQuery("#table_pictures").append('<p id="remove-image-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span>Loading...</p>');
            jQuery("#item-form").validationEngine('detach');
            var fisRe = /^.+\.(jpg|bmp|gif|png|jpeg|PNG|JPG|GIF|JPEG)$/i;
            var path = jQuery(this).val();

            if (path.search(fisRe) == -1) {
                jQuery("#remove-image-loading").remove();
                alert(' JPG, JPEG, BMP, GIF, PNG only!');
                return false;
            }
            jQuery(this).upload(folderPath, function(responce) {
                if( responce =='' ) {
                    jQuery("#remove-image-loading").remove();
                    alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    if(jbdUtils.getProperty("enable_resolution_check")) {
                        var warning = jQuery(xml).find("warning").attr("value");
                        if (typeof warning !== 'undefined') {
                            jQuery("#remove-image-loading").remove();
                            var wHeight = jQuery(xml).find("warning").attr("height");
                            var wWidth = jQuery(xml).find("warning").attr("width");
                            alert(Joomla.JText._("LNG_IMAGE_SIZE_WARNING")+" (Width:" + wWidth + ", Height:" + wHeight + ")");
                            return false;
                        }
                    }
                    jQuery(xml).find("picture").each(function() {
                        if(jQuery(this).attr("error") == 0 ) {
                            self.addPicture(
                                folder + jQuery(this).attr("path"),
                                jQuery(this).attr("name")
                            );
                            jQuery("#remove-image-loading").remove();
                        }
                        else if( jQuery(this).attr("error") == 1 )
                            alert(Joomla.JText._('LNG_FILE_ALLREADY_ADDED'));
                        else if( jQuery(this).attr("error") == 2 )
                            alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                        else if( jQuery(this).attr("error") == 3 )
                            alert(Joomla.JText._('LNG_ERROR_GD_LIBRARY'));
                        else if( jQuery(this).attr("error") == 4 )
                            alert(Joomla.JText._('LNG_ERROR_RESIZING_FILE'));
                    });
                    jQuery(this).val('');
                }
            }, 'html');
            jQuery("#item-form").validationEngine('attach');
        });
    }

    /**
     * Removes the image from the list by its position
     *
     * @param pos int position of the image where to find it on the list
     */
    removePicture(pos)
    {
        let lis = document.querySelectorAll('#sortable li');

        if (lis==null) {
            alert('Undefined List, contact administrator !');
        }

        if(pos >= lis.length)
            pos = lis.length-1;

        //lis[pos].parentNode.removeChild(lis[pos]);

        this.checkNumberOfPictures();
    }

    /**
     * Get the list where the images are saved and removes them all
     */
    removeAllPicture()
    {
        let lis=document.querySelectorAll('#sortable li');

        if (lis==null) {
            alert('Undefined List, contact administrator !');
        }

        let maxImages = lis.length;

        for (let i = 0; i < maxImages; i++) {
            let pos = i;

            if (pos >= lis.length)
                pos = lis.length-1;

            lis[pos].parentNode.removeChild(lis[pos]);
        }

        this.checkNumberOfPictures();
    }

    /**
     * Initialize a click event for the button. When it is clicked removes the file from the path it is saved and
     * empties all fields of form related with it
     */
    btn_removefile()
    {
        let self = this;

        jQuery('#btn_removefile').click(function() {
            jQuery("#item-form").validationEngine('detach');
            let pos = jQuery('#crt_pos').val();
            let path = jQuery('#crt_path').val();
            jQuery(this).upload(this.removePath + path + '&_pos='+pos, function(responce) {
                if( responce =='' ) {
                    alert(Joomla.JText._('LNG_ERROR_REMOVING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    jQuery(xml).find("picture").each(function() {
                        if(jQuery(this).attr("error") == 0 ) {
                            self.removePicture( jQuery(this).attr("pos") );
                        }
                        else if( jQuery(this).attr("error") == 2 ) {
                            self.removePicture(pos);
                        }
                        else if( jQuery(this).attr("error") == 3 )
                            alert(Joomla.JText._('LNG_FILE_DOESNT_EXIST'));
                    });
                    jQuery('#crt_pos').val('');
                    jQuery('#crt_path').val('');
                }
            }, 'html');
            jQuery("#item-form").validationEngine('detach');
        });
    }

    /**
     * Initialize a javascript event for the multi File Uploader, so when its value is changed(files has been added to be uploaded),
     * it uploads the file and appends it to the list
     *
     * @param folderID string folder name where this file will be added
     * @param folderIDPath string path to where this file will be founded
     */
    multiFileUploader(folderID, folderIDPath)
    {
        let self = this;

        jQuery("#multiFileUploader").change(function() {
            jQuery("#remove-file-loading").remove();
            jQuery("#attachment-list").find('.jbd-item-list').append('<p id="remove-file-loading" class="text-center"><span class="icon-refresh icon-refresh-animate"></span> Loading...</p>');
            jQuery("#item-form").validationEngine('detach');
            var path = jQuery(this).val();
            jQuery(this).upload(folderIDPath, function(responce) {
                if( responce =='' ) {
                    jQuery("#remove-file-loading").remove();
                    alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    jQuery("#remove-file-loading").remove();
                    jQuery(xml).find("attachment").each(function() {
                        if(jQuery(this).attr("name").length > jbdUtils.getProperty("maxFilenameLength")) {
                            alert(Joomla.JText._('LNG_FILENAME_TOO_LONG'));
                        }
                    else if(jQuery(this).attr("error") == 0 ) {
                            if(jQuery("#attachment-list #sortable-attachment li").length < self.maxAttachments) {
                                self.addAttachment(
                                    folderID + jQuery(this).attr("path"),
                                    jQuery(this).attr("name")
                                );
                                jQuery("#multiFileUploader").val("");
                            } else {
                                alert(Joomla.JText._('LNG_MAX_ATTACHMENTS_ALLOWED')+self.maxAttachments);
                            }
                        }
                        else if( jQuery(this).attr("info"))
                            alert(jQuery(this).attr("info"));
                        else {
                            alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                        }
                    });
                }
            }, 'html');
            jQuery("#item-form").validationEngine('attach');
        });
    }

    /**
     * After the attach has been uploaded, display it and append it to the list
     *
     * @param path string path where the attach has been added
     * @param name string attach name
     */
    addAttachment(path, name)
    {
        let self = this;

        var attachTemplate = jQuery('#attachment-item-template').html();

        var newId = Math.random().toString(36).substring(7);
        var status = 1;

        attachTemplate = attachTemplate.replaceAll('{attachment_id}', newId);
        attachTemplate = attachTemplate.replaceAll('{attachment_name}', name);
        attachTemplate = attachTemplate.replaceAll('{attachment_path}', jbdUtils.basename(path));
        attachTemplate = attachTemplate.replaceAll('{attachment_full_path}', path);
        attachTemplate = attachTemplate.replaceAll('{attachment_status}', status);

        jQuery('#attachment-list').find('.jbd-item-list').append(attachTemplate);

        jQuery('#attachment-list').jbdList({
            statusCallback: self.changeAttachmentStatus,
            deleteCallback: self.deleteAttachment,
            statusSelector: 'attachment_status_',
            deleteMsg: Joomla.JText._('LNG_CONFIRM_DELETE_ATTACHMENT')
        });
    }

    /**
     * After the image has been uploaded, display it and append it to the list
     *
     * @param path string path where the image has been added
     * @param name string image name
     */
    addPicture(path, name)
    {
        let self = this;

        var pictureTemplate = jQuery('#picture-item-template').html();

        var newId = Math.random().toString(36).substring(7);
        var status = 1;

        pictureTemplate = pictureTemplate.replaceAll('{picture_id}', newId);
        pictureTemplate = pictureTemplate.replaceAll('{picture_info}', '');//before was replaced by name
        pictureTemplate = pictureTemplate.replaceAll('{picture_path}', jbdUtils.basename(path));
        pictureTemplate = pictureTemplate.replaceAll('{picture_full_path}', path);
        pictureTemplate = pictureTemplate.replaceAll('{picture_enable}', status);
        var link = this.picturesFolder+path;
        var link = '<img src="'+link+'">';
        pictureTemplate = pictureTemplate.replaceAll('{picture_link}', link);

        jQuery('#pictures-list').find('.jbd-item-list').append(pictureTemplate);

        jQuery('#pictures-list').jbdList({
            statusCallback: self.changePictureStatus,
            deleteCallback: self.deletePicture,
            statusSelector: 'picture_enable_',
            deleteMsg: Joomla.JText._('LNG_CONFIRM_DELETE_PICTURE')
        });

        this.checkNumberOfPictures();
    }

    /**
     * Enable or Disable the attach status
     *
     * @param id int id of the attach. It is used to find the attach location
     * @param oldVal int old Value that was the attach status and change it to the new one
     */
    changeAttachmentStatus(id, oldVal)
    {
        var newVal = (oldVal == 0) ? 1 : 0;

        jQuery('#attachment_status_'+id).val(newVal);
    }

    /**
     * Enable or Disable the image status
     *
     * @param id int id of the image. It is used to find the image location
     * @param oldVal int old Value that was the image status and change it to the new one
     */
    changePictureStatus(id, oldVal)
    {
        var newVal = (oldVal == 0) ? 1 : 0;

        jQuery('#picture_enable_'+id).val(newVal);
    }

    /**
     * Empty the attachments path from form and clicks the button
     */
    deleteAttachment(id)
    {
        jQuery('#crt_path_a').val(jQuery('#attachment_path_'+id));
        jQuery('#btn_removefile_at').click();
    }

    /**
     * Empty the picture path from form and clicks the button
     */
    deletePicture(id)
    {
        jQuery('#crt_path').val(jQuery('#picture_path_'+id));
        jQuery('#btn_removefile').click();
    }

    /**
     * Initialize a click event for the button. When it is clicked removes the file from the path it is saved and
     * empties all fields of form related with it
     *
     * @param removePath_at string path where to find the file
     */
    btn_removefile_at(removePath_at)
    {
        if (typeof removePath_at === "undefined") {
            removePath_at = this.removePath;
        }

        jQuery('#btn_removefile_at').click(function() {
            jQuery("#item-form").validationEngine('detach');
            pos = jQuery('#crt_pos_a').val();
            path = jQuery('#crt_path_a').val();
            jQuery(this).upload(removePath_at + path + '&_pos='+pos, function(responce) {
                if (responce == '') {
                    alert(Joomla.JText._('LNG_ERROR_REMOVING_FILE'));
                    jQuery(this).val('');
                }
                else {
                    var xml = responce;
                    jQuery(xml).find("picture").each(function() {
                        if(jQuery(this).attr("error") == 0 ) {
                            // removeAttachment( jQuery(this).attr("pos") );
                        }
                        else if( jQuery(this).attr("error") == 2 )
                            alert(Joomla.JText._('LNG_ERROR_REMOVING_FILE'));
                        else if( jQuery(this).attr("error") == 3 )
                            alert(Joomla.JText._('LNG_FILE_DOESNT_EXIST'));
                    });
                    jQuery('#crt_pos_a').val('');
                    jQuery('#crt_path_a').val('');
                }
            }, 'html');
            jQuery("#item-form").validationEngine('detach');
        });
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeCoverImage()
    {
        jQuery("#cover-imageLocation").val("");
        jQuery("#cover-picture-preview").html("<i class='la la-image'></i>");
        jQuery("#cover-imageUploader").val("");
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeLogo() {
        jQuery("#imageLocation").val("");
        jQuery("#picture-preview").html("<i class='la la-image'></i>");
        jQuery("#imageUploader").val("");
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeAd()
    {
        jQuery("#ad-imageLocation").val("");
        jQuery("#ad-picture-preview").html("<i class='la la-image'></i>");
        jQuery("#ad-imageUploader").val("");
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeCompanyLogo()
    {
        jQuery("#company-imageLocation").val("");
        jQuery("#company-picture-preview").html("<i class='la la-image'></i>");
        jQuery("#company-imageUploader").val("");
    }
    /* Company & Conference & SessionLocation & Speaker */

    /**
     * Removes image and empty all fields related with it
     */
    removeMarker() {
        jQuery("#markerLocation").val("");
        jQuery("#marker-preview").html("");
        jQuery("#markerfile").val("");
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeMapMarker()
    {
        jQuery("#mapimageLocation").val("");
        jQuery("#mappicture-preview").html("");
        jQuery("#mapimageUploader").val("");
    }

    /**
     * Removes image and empty all fields related with it
     */
    removeFeatureMapMarker()
    {
        jQuery("#fMarkerimageLocation").val("");
        jQuery("#fMarkerpicture-preview").html("");
        jQuery("#fMarkerimageUploader").val("");
    }
    /* Category */

    /**
     * Removes videos or sounds based on the id of the div that contain the item
     * @param id
     */
    removeRow(id)
    {
        jQuery('#'+id).remove();
        self.checkNumberOfVideos();
        self.checkNumberOfSounds();
    }

    /**
     * Remove Service logo and empty all fields related with it on the form
     *
     * @param id int logo id, used also to get the fields that are used to display the image
     */
    removeServiceLogo(id)
    {
        jQuery('#service-imageLocation' + id).val("");
        jQuery('#service-picture-preview' + id).html("<i class='la la-image'></i>");
        jQuery('#service-imageUploader' + id).val("");
    }

    /**
     * Show the cropper modal with the image that will be cropped inside
     *
     * @param dataUri string image URI
     * @param type string image type
     * @param picId int image id
     */
    showCropper(dataUri, type, picId)
    {
        let self = this;

        if (typeof this.cropper !== 'undefined')
            this.cropper.destroy();
        let cropped = false;

        if (picId === undefined || picId === null)
            picId = '';

        jQuery('#cropper-modal').jbdModal();

        jQuery('#cropper-image').attr('src', '');
        jQuery('#cropper-image').attr('src', dataUri);
        jQuery('#save-cropped').unbind('click');
        jQuery('#save-cropped').on("click", function (event) {
            self.saveCropped(type, picId);
        });

        var width;
        var height;
        if (type.length == 0) {
            this.removeLogo();
            width = jbdUtils.getProperty("logo_width");
            height = jbdUtils.getProperty("logo_height");
        }
        else if (type === 'cover-') {
            width = jbdUtils.getProperty("cover_width");
            height = jbdUtils.getProperty("cover_height");
            this.removeCoverImage();
        }
        else if (type === 'service-') {
            width = jbdUtils.getProperty("gallery_width");
            height = jbdUtils.getProperty("gallery_height");
            this.removeServiceLogo(picId);
        }
        else {
            width = jbdUtils.getProperty("gallery_width");
            height = jbdUtils.getProperty("gallery_height");
        }

        width = parseInt(width);
        height = parseInt(height);

        let left = 0;
        if (width < 490) {
            left = (490-width) / 2;
        }

        var image = document.getElementById('cropper-image');
        this.cropper = new Cropper(image, {
            aspectRatio: width / height,
            cropBoxResizable: false,
            dragMode: 'move',
            scalable: true,
            data: {
                width: width,
                height: height,
                left: left,
                top: 0
            },
            crop: function (e) {
            }
        });
    }

    /**
     * Save cropped image
     *
     * @param type string image type
     * @param picId int ID that will be used where to set the image
     */
    saveCropped(type, picId)
    {
        let self = this;

        this.cropper.getCroppedCanvas().toBlob(function (blob) {
            var formData = new FormData();
            blob['name'] = 'cropped.' + blob['type'].substr(blob['type'].indexOf('/') + 1, blob.type.length);
            formData.append('croppedimage', blob);

            let folderID = '';
            let submitPath = '';

            if (type.length == 0) {
                folderID = self.folderIDs['default'].folderID;
                submitPath = self.folderIDs['default'].folderIDPath;
            } else {
                folderID = self.folderIDs[type].folderID;
                submitPath = self.folderIDs[type].folderIDPath;
            }

            submitPath += '&crop=1';
            jQuery.ajax(submitPath, {
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (xml) {
                    jQuery(xml).find("picture").each(function () {
                        if (jQuery(this).attr("error") == 0) {
                            self.setUpImage(
                                folderID + jQuery(this).attr("path"),
                                jQuery(this).attr("name"),
                                type,
                                picId
                            );
                            jQuery("#remove-image-loading").remove();
                        }
                        else if (jQuery(this).attr("error") == 1)
                            alert(Joomla.JText._('LNG_FILE_ALLREADY_ADDED'));
                        else if (jQuery(this).attr("error") == 2)
                            alert(Joomla.JText._('LNG_ERROR_ADDING_FILE'));
                        else if (jQuery(this).attr("error") == 3)
                            alert(Joomla.JText._('LNG_ERROR_GD_LIBRARY'));
                        else if (jQuery(this).attr("error") == 4)
                            alert(Joomla.JText._('LNG_ERROR_RESIZING_FILE'));
                    });

                    jQuery.jbdModal.close();
                    self.cropper.destroy();
                },
                error: function () {
                    console.log('Upload error');
                }
            });
        },"image/jpeg", 0.8);
    }

    /**
     * Initiate image uploader dropzone
     *
     * @param dropZoneDiv string id of the div of the dropzone
     * @param url string url with the path and settings passed to it for the image upload
     * @param clickableButtons string button that will be clicked
     * @param MultiLanguageMessage string Text to upload
     * @param ImagePath string folder where the image will be saved
     * @param paralelUploadNumber int number of how many can be uploaded at the same time
     * @param pictureAdder javascript function to call for image adder
     */
    imageUploaderDropzone(dropZoneDiv,url,clickableButtons,MultiLanguageMessage,ImagePath,paralelUploadNumber,pictureAdder)
    {
        let self = this;
        Dropzone.autoDiscover = false;

        jQuery(dropZoneDiv).dropzone({
            url: url,
            addRemoveLinks: true,
            acceptedFiles:'image/gif,.jpg,.jpeg,.png',
            maxFilesize: 10, // MB
            enqueueForUpload: true,
            dictRemoveFile: "Remove Preview",
            autoProcessQueue: true,
            parallelUploads: paralelUploadNumber,
            dictDefaultMessage: MultiLanguageMessage,
            clickable: clickableButtons,

            // The setting up of the dropzone
            init: function () {
                var myDropzone = this;
                jQuery("#submitAll").click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // var images = myDropzone.getQueuedFiles();
                    //console.log(images);

                    myDropzone.processQueue();
                    jQuery('button').each(function () {
                        jQuery(this).remove('#add');
                    });
                });
                /* this.on("addedfile", function (file) {
                    var addButton = Dropzone.createElement("<button id='add' class='btn btn-primary start'>Upload</button>");
                    addButton.addEventListener("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        myDropzone.processFile(file);
                        file.previewElement.classList.add("dz-success");
                        jQuery(this).remove();
                    });
                    file.previewElement.appendChild(addButton);
                }); */
                // this.on("thumbnail", function(file, dataUri) {
                //     var cropButton = Dropzone.createElement("<button id='add' class='btn btn-primary start'>Crop</button>");
                //
                //     if(file.width > 500 ||  file.height > 500) {
                //         cropButton.addEventListener("click", function (e) {
                //             e.preventDefault();
                //             e.stopPropagation();
                //             showImage(file.width, file.height, dataUri);
                //         });
                //         file.previewElement.appendChild(cropButton);
                //     }
                // });
            },
            success: function (file, response) {
                var xml = response;
                var name;
                name = file.name.replace(/[^0-9a-zA-Z.]/g, '_');
                file.previewElement.classList.add("dz-success");
                switch (pictureAdder){
                    case "addPicture":
                        if((file.height >= jbdUtils.getProperty('gallery_height') && file.width >= jbdUtils.getProperty('gallery_width')) || !jbdUtils.getProperty("enable_resolution_check"))
                            self.addPicture(ImagePath + name, name);
                        else
                            alert("["+name+"] "+Joomla.JText._("LNG_IMAGE_SIZE_WARNING")+" (Width:"+jbdUtils.getProperty('gallery_width')+", Height:"+jbdUtils.getProperty('gallery_height')+")");
                        break;
                    case "setUpLogo":
                        setUpLogo(name);
                        break;
                    case "setUpLogoExtraOptions":
                        setUpLogoExtraOptions(ImagePath + name,name);
                        break;
                    default :
                        alert("Error! no image creation function defined for this view");
                        console.log("no image creation function defined");
                        break;
                }
            },
            error: function (file, response) {
                file.previewElement.classList.add("dz-error");
                console.log(response);
            }
        });
    }

    /**
     * Get partly the name up to 14 chars
     *
     * @param imageName string image name
     * @returns {string|*}
     */
    photosNameFormater(imageName)
    {
        var NameLength = imageName.length;
        if (NameLength > 14) {
            return  imageName.substring(imageName.length - 14);
        } else {
            return imageName;
        }
    }

    /**
     * Add a new video section to upload the video
     */
    addVideo()
    {
        var count = jQuery("#video-container").children().length + 1;
        let id = 0;
        var outerDiv = document.createElement('div');
        outerDiv.setAttribute('class', 'video-item');
        outerDiv.setAttribute('id', 'detailBox' + count);

        var newLabel = document.createElement('label');
        newLabel.setAttribute("for", id);
        newLabel.innerHTML = Joomla.JText._('LNG_VIDEO');

        var cointainerDiv = document.createElement('div');
        cointainerDiv.setAttribute('class', 'input-group');

        var newInput = document.createElement('input');
        newInput.setAttribute('name', 'videos[]');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('id', id);
        newInput.setAttribute('class', 'form-control');

        var appendDiv = document.createElement('div');
        appendDiv.setAttribute('class', 'input-group-append');

        var newButton = document.createElement('button');
        newButton.setAttribute('class', 'btn btn-secondary');
        newButton.setAttribute('onclick', 'uploadInstance.removeRow("detailBox' + count + '");checkNumberOfVideos();');

        var newIcon = document.createElement('i');

        newIcon.setAttribute('class', 'la la-lg la-remove');

        newButton.appendChild(newIcon);
        appendDiv.appendChild(newButton);

        cointainerDiv.appendChild(newInput);
        cointainerDiv.appendChild(appendDiv);

        var newLabel2 = document.createElement('label');
        newLabel2.setAttribute("for", id);
        newLabel2.innerHTML = Joomla.JText._('LNG_TITLE');

        var newInput2 = document.createElement('input');
        newInput2.setAttribute('name', 'videos_title[]');
        newInput2.setAttribute('id', id);
        newInput2.setAttribute('type', 'text');
        newInput2.setAttribute('class', 'input_txt');
        newInput2.setAttribute('style', "height: 34px");

        var newLabel3 = document.createElement('label');
        newLabel3.setAttribute("for", id);
        newLabel3.innerHTML = Joomla.JText._('LNG_DESCRIPTION');

        var newInput3 = document.createElement('textarea');
        newInput3.setAttribute('name', 'videos_desc[]');
        newInput3.setAttribute('id', id);
        newInput3.setAttribute('class', 'input_txt');
        newInput3.setAttribute('rows', '5'); 
        

        
        outerDiv.appendChild(newLabel);
        outerDiv.appendChild(cointainerDiv);
        
        outerDiv.appendChild(newLabel2);
        outerDiv.appendChild(newInput2);

        outerDiv.appendChild(newLabel3);
        outerDiv.appendChild(newInput3); 

        var facilityContainer = jQuery("#video-container");
        facilityContainer.append(outerDiv);

        this.checkNumberOfVideos();
    }

    /**
     * Check maximum number of videos uploaded. If maximum number is reached then hide the uploader
     */
    checkNumberOfVideos()
    {
        var nrVideos = jQuery('input[name*="videos[]"]').length;

        if (nrVideos < this.maxVideos) {
            jQuery("#add-video").show();
        }
        else {
            jQuery("#add-video").hide();
        }
    }

    /**
     * Add a sound div next to the last one
     */
    addSound()
    {
        var count = jQuery("#sound-container").children().length + 1;
        let id = 0;
        var outerDiv = document.createElement('div');
        outerDiv.setAttribute('class', 'detail_box');
        outerDiv.setAttribute('id', 'soundDetailBox' + count);

        var newLabel = document.createElement('label');
        newLabel.setAttribute("for", id);
        newLabel.innerHTML = Joomla.JText._('LNG_SOUND');

        var newInput = document.createElement('textarea');
        newInput.setAttribute('name', 'sounds[]');
        newInput.setAttribute('id', id);
        newInput.setAttribute('class', 'input_txt');
        newInput.setAttribute('rows', '3');

        var img_del = document.createElement('img');
        img_del.setAttribute('src', jbdUtils.getProperty("imageRepo") + "/assets/images/del_icon.png");
        img_del.setAttribute('alt', 'Delete option');
        img_del.setAttribute('height', '12px');
        img_del.setAttribute('width', '12px');
        img_del.setAttribute('align', 'left');
        img_del.setAttribute('onclick', 'uploadInstance.removeRow("soundDetailBox' + count + '")');
        img_del.setAttribute('style', "cursor: pointer; margin:3px;");

        var clearDiv = document.createElement('div');
        clearDiv.setAttribute('class', 'clear');

        outerDiv.appendChild(newLabel);
        outerDiv.appendChild(newInput);
        outerDiv.appendChild(img_del);
        outerDiv.appendChild(clearDiv);

        var facilityContainer = jQuery("#sound-container");
        facilityContainer.append(outerDiv);

        this.checkNumberOfSounds();
    }

    /**
     * Check number of uploaded sounds. If maximum number of sounds is reached then hide the uploader
     */
    checkNumberOfSounds()
    {
        var nrSounds = jQuery('textarea[name*="sounds[]"]').length;
        if (nrSounds < 15) {
            jQuery("#add-sound").show();
        }
        else {
            jQuery("#add-sound").hide();
        }
    }

    /**
     * Remove specific item by catching its row id and removing it
     *
     * @param id int Row ID
     */
    removeRow(id)
    {
        jQuery('#' + id).remove();
        this.checkNumberOfVideos();
        this.checkNumberOfSounds();
    }
}

class JBDUploadHelper
{
    static getUploadInstance(params)
    {
        if (typeof params !== 'undefined') {
            if (typeof params['maxPictures'] !== 'undefined') {
                JBDUploadHelper.maxPictures = params['maxPictures'];
            }
        }

        return new JBDUpload(params);
    }

    static getMaxAllowedNumber()
    {
        return JBDUploadHelper.maxPictures;
    }
};/**
 * JBD Quote Request javascript Class
 */
class JBDQuoteRequest{

    /**
     * Constructor
     *
     * @param categoryId int ID of the category
     */
    constructor(categoryId = null) {
    	this.response_success = 1;
    	this.response_error = 0;

    	this.validate_default = 1;
    	this.validate_location = 2;
    	this.validate_input = 3;
    	this.validate_user = 4;
    	this.validate_skip = 0;

        this.category_id = categoryId;
    }

    /**
     * Opens modal that will hold the quote request. Modal HTML must already be present on the page.
     */
    init(categoryId) {
    	this.category_id = categoryId;
    	this.modal = jQuery('#quote-request-modal');
        this.modal.jbdModal();
        this.modal.find('.modal-container').html('');
        this.modal.find('#loading-quote-requests').find('.msg').text(Joomla.JText._('LNG_RETRIEVING_QUESTIONS'));
        this.modal.find('#loading-quote-requests').show();
        this.retrieveQuestions();
    }

    /**
     * Retrieves the questions HTML and attaches it inside the container.
     * category_id must be set in order to retrieve the right questions.
     */
    retrieveQuestions() {
        let questionsUrl = jbdUtils.getAjaxUrl('getQuestions', 'requestquote');
        let self = this;
        let categoryId = this.category_id;

        jQuery("#quotes-form").validationEngine('attach');
        
        jQuery.ajax({
            type: "GET",
            url: questionsUrl,
            data: {categoryId: categoryId, cache: false},
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_error) {
                    console.error(data);
                    alert(data.message);
                    self.closeModal(); // close Modal if error occurs
                } else if (data.status == self.response_success) {
                    self.modal.find('#loading-quote-requests').hide();
                    // attach questions HTML to modal container
                    self.modal.find('.modal-container').html(data.data);
                    self.initAutocomplete();
                }
            }
        });
    }

    /**
     * Shows the next step and hides current one. If validation fails, it does not continue to the next step.
     *
     * @param step int count of the step
     * @param validate int validation type
     * @returns {boolean}
     */
    openStep(step, validate) {
        if (typeof validate === 'undefined') {
            validate = this.validate_default;
        }
        if (validate != this.validate_skip && !this.validateStep(validate)) {
            alert(Joomla.JText._('LNG_PLEASE_FILL_THE_DETAILS'));
            return ;
        }

        let oldStep = jQuery('.step-container.step-active');
        oldStep.hide();
        oldStep.removeClass('step-active');

        // if we are validating the location step, call also the searchListings
        if (validate == this.validate_location) {
            let loadingDiv = jQuery('#loading-quote-requests');
            let loadingMessage = loadingDiv.find('.msg');
            loadingMessage.text(Joomla.JText._('LNG_SEARCHING_LISTINGS'));

            loadingDiv.show();

            this.searchListings(function () {
                let newStep = jQuery('#step-' + step);
                newStep.addClass('step-active');
                newStep.fadeIn();
            });
        } else {
            let newStep = jQuery('#step-' + step);
            newStep.addClass('step-active');
            newStep.fadeIn();
        }
    }

    /**
     * Validates a step. The validate param will determine what kind of validation will be made.
     * validate_default means radio/checkbox validation.
     *
     * @param validate
     * @returns {boolean}
     */
    validateStep(validate) {
        if (validate == this.validate_default) {
            let isChecked = false;
            jQuery('.step-active .options-container .option-row').each(function () {
                let checkbox = jQuery(this).find('.question-container').find('input');
                if (typeof checkbox.attr('checked') !== 'undefined') {
                    isChecked = true;
                    return true;
                }
            });

            return isChecked;
        } else if (validate == this.validate_location) {
            return jQuery('.step-active').find('.zipcode-quote').val().length != 0;
        } else if (validate == this.validate_user) {
        	console.debug("validate");
            return jQuery("#quotes-form").validationEngine('validate');
        } else if (validate == this.validate_input) {
            let isFilled = false;
            jQuery('.step-active .options-container .option-row').each(function () {
                let input = jQuery(this).find('input').val();
                if (input.trim() !== '') {
                    isFilled = true;
                    return true;
                }
            });
            return isFilled;
        }
    }

    /**
     * Initializes the autocomplete for the location autosuggestion during the location step.
     */
    initAutocomplete() {
        let element = document.getElementsByClassName('zipcode-quote')[0];
        jQuery(document).ready(function () {
            JBDMapHelper.initAutocomplete(element, function (place) {
                jQuery("#quote-latitude").val(place['latitude']);
                jQuery("#quote-longitude").val(place['longitude']);
            }, false, false);
        });
    }

    /**
     * Submits all the information gathered throughout the steps. If response is successful, it will
     * show the 'Thank you' step and call the contactListings function in the background.
     */
    submitRequest() {
        let data = jQuery('#quotes-form').serializeArray();
        let saveQuote = jbdUtils.getAjaxUrl('saveQuoteRequests', 'requestquote');
        let self = this;

        let loadingMessage = this.modal.find('#loading-quote-requests').find('.msg');
        let loadingDiv = this.modal.find('#loading-quote-requests');

        this.modal.find('.modal-container').html('');
        loadingMessage.text(Joomla.JText._('LNG_SENDING_REQUESTS'));
        loadingDiv.show();

        jQuery.ajax({
            type: "POST",
            url: saveQuote,
            data: {data: data},
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_error) {
                    self.closeModal();
                    console.error(data);
                    alert(data.message);
                } else if (data.status == self.response_success) {
                    self.contactListings(data.data.quoteId, data.data.companyIds);

                    loadingDiv.hide();
                    self.modal.find('#thankyou-step').fadeIn();
                }
            }
        });
    }

    /**
     * Searches if there are any listings present for the given location. If long and lat are not determined, it will
     * get the coordinates based on the location string.
     *
     * If no listings are found, it will fail. If successful, it will save the lat and long (in case they were not determined).
     *
     * @param callback gets called in case of success
     */
    searchListings(callback) {
        let searchListing = jbdUtils.getAjaxUrl('searchListingsAjax', 'requestquote');
        let self = this;

        let lat = jQuery('#quote-latitude').val();
        let long = jQuery('#quote-longitude').val();
        let locationString = jQuery('#quote-zipcode').val();

        jQuery.ajax({
            type: "GET",
            url: searchListing,
            data: {
                categoryId: self.category_id,
                latitude: lat,
                longitude: long,
                location: locationString
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_error) {
                    self.closeModal();
                    console.error(data);
                    let html = '<div class="jbd-container" style="display:none"><div class="jmodal-sm"><div class="jmodal-header"><p class="jmodal-header-title">' + data.title +'</p>'
        			+'<a href="#close-modal" rel="modal:close" class="close-btn"><i class="la la-close "></i></a>  </div> <div class="jmodal-body"><p>' + data.message + '</p></div> </div></div>';

                    jQuery(html).appendTo('body').jbdModal();
                } else if (data.status == self.response_success) {
                    let loadingDiv = self.modal.find('#loading-quote-requests');
                    jQuery('#quote-latitude').val(data.data.latitude);
                    jQuery('#quote-longitude').val(data.data.longitude);
                    loadingDiv.hide();
                    callback();
                }
            }
        });
    }

    /**
     * Calls the contact listings endpoint in order to send emails to the listings.
     *
     * @param quoteId int ID of the request quote
     * @param companyIds string list of concatenated company ids
     */
    contactListings(quoteId, companyIds) {
        let contactListings = jbdUtils.getAjaxUrl('contactListingsAjax', 'requestquote');

        console.log(Joomla.JText._('LNG_CONTACTING_LISTINGS'));
        jQuery.ajax({
            type: "GET",
            url: contactListings,
            data: {
                quoteId: quoteId,
                companyIds: companyIds
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                console.log(data);
            }
        });
    }

    /**
     * Closes the modal
     */
    closeModal() {
        this.modal.find('#thankyou-step').hide();
        this.modal.find('#loading-quote-requests').hide();
        jQuery.jbdModal.close();
    }
}

let jbdQuoteRequest = new JBDQuoteRequest();;/**
 * JBD Quote Message javascript Class
 */
class JBDQuoteMessages{

    /**
     * Constructor
     */
    constructor() {
        this.response_success = 1;
        this.response_error = 0;

        this.allowSend = false;
        this.messages = [];
        this.lastMsgId = 0;
        this.firstMsgId = 0;

        this.pollingInterval = JBDConstants.QUOTE_MESSAGES_POLLING_INTERVAL;
    }

    /**
     * Initializes chat. Chat HTML must already be present on the page.
     *
     *  @param replyId int ID of the quote reply
     * @param userId int optional ID of the user that is initializing the chat
     * @param options array of options (optional)
     *        [
     *          allowSend => if false, will disable possibility to send message
     *        ]
     */
    init(replyId, userId = null, options = null) {
        this.replyId = replyId;
        this.userId = userId;

        if (options != null) {
            if (typeof options['allowSend'] !== 'undefined') {
                this.allowSend = options['allowSend'];
            }
        }

        this.chatContainer = jQuery('#chat-container-' + this.replyId);
        this.chatFooter = this.chatContainer.find('.chat-footer');
        this.chatInput = this.chatContainer.find('.chat-textbox');
        this.chatSendBtn = this.chatContainer.find('.btn-send');
        this.chatBody = this.chatContainer.find('.chat-body');
        this.chatLoading = this.chatBody.find('.loading-quote-messages');

        let self = this;

        if (this.allowSend) {
            // send message if enter key is pressed
            this.chatInput.on("keydown", function (event) {
                if (event.which == 13) {
                    self.sendMessage();
                }
            });
            // send message if send button is clicked
            this.chatSendBtn.on("click", function (event) {
                self.sendMessage();
            });

        } else {
            this.chatFooter.attr('style', 'display:none !important');
        }

        // if user scrolls on top of chat body, load previous messages
        this.chatBody.on('scroll', function () {
            if (jQuery(this).scrollTop() == 0) {
                self.loadHistory();
            }
        });

        // show loading icon while retrieving messages
        this.chatLoading.show();
        this.chatBody.hide();

        this.getMessages();

        // hide loading icon when messages are retrieved
        this.chatLoading.hide();
        this.chatBody.show();

        // set polling interval for retrieving new messages
        this.interval = setInterval(function () {
            self.pollMessages();
        }, self.pollingInterval);
    }

    /**
     * Retrieves messages for a quote reply ID.
     */
    getMessages() {
        let self = this;
        let getMessages = jbdUtils.getAjaxUrl('getMessagesAjax', 'requestquotemessages');

        jQuery.ajax({
            type: "POST",
            url: getMessages,
            data: {
                replyId: self.replyId
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_success) {
                    self.messages = data.data;
                    self.chatInput.val('');
                    self.renderMessages(true);

                    self.chatLoading.hide();
                    self.chatBody.show();
                } else {
                    console.error(data);
                    alert(data.message);
                }
            }
        });
    }

    /**
     * Renders a list of messages on the screen.
     *
     * @param scrollDown boolean if true, it will scroll down to the end of the screen once messages are rendered.
     * @param messages if not defined, messages will be retrieved at this.messages of the instance
     */
    renderMessages(scrollDown, messages) {
        if (typeof messages === 'undefined') {
            messages = this.messages;
        }

        if (typeof scrollDown === 'undefined') {
            scrollDown = false;
        }

        for (let i in messages) {
            let msg = messages[i];

            // is this message already rendered on screen? If so, don't render it again.
            if (typeof msg !== 'undefined' && jQuery('#msg-' + msg.msgId).length === 0 && messages.hasOwnProperty(i)) {
                let html = this.getMessageHtml(msg);

                msg.msgId = parseInt(msg.msgId);
                if (this.lastMsgId != 0) {
                    // if message is a new one, append it at the bottom of the screen
                    if (msg.msgId > this.lastMsgId) {
                        this.chatBody.append(html);
                    }
                    // if message is an old one (from history), append it at the top of the screen
                    else {
                        this.chatBody.find('.chat-top').after(html);
                    }
                }
                // if lastId is 0, it means that this is the first message to be rendered. Append it on the bottom
                else {
                    this.chatBody.append(html);
                }

                // keep track of the last message on screen
                if (this.lastMsgId < msg.msgId) {
                    this.lastMsgId = msg.msgId;
                }

                // keep track of the first message on screen
                if (this.firstMsgId === 0) {
                    this.firstMsgId = msg.msgId;
                } else if (this.firstMsgId > msg.msgId) {
                    this.firstMsgId = msg.msgId;
                }
            }
        }

        // scroll down at the bottom
        if (scrollDown) {
            if (typeof this.chatBody[0] !== 'undefined') {
                this.chatBody.scrollTop(this.chatBody[0].scrollHeight);
            }
        }
    }

    /**
     * Creates the HTML for a single message bubble.
     *
     * @param msg object
     * @returns {string}
     */
    getMessageHtml(msg) {
        let html = '';
        let msgClass = 'msg-rcvd';

        // if sender is not defined, just pick a user at random to be as sender
        if (this.userId == null) {
            this.userId = msg.senderId;
        }

        if (msg.senderId == this.userId) {
            msgClass = 'msg-snt';
        }

        let date = new Date(msg.created);
        html += '<div class="msg" id="msg-' + msg.msgId + '">';
        html += '<div class="' + msgClass + '">';
        html += '<div class="msg-txt">';
        html += msg.text;
        html += '</div>';
        html += '<p class="msg-date">' + date.toLocaleString() + '</p>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    /**
     * Sends a single message.
     *
     * @returns {boolean}
     */
    sendMessage() {
        let msg = {};
        let text = this.chatInput.val();
        if (text.length == 0 || jbdUtils.isBlank(text)) {
            return false;
        }

        let self = this;
        let sendMessage = jbdUtils.getAjaxUrl('sendMessageAjax', 'requestquotemessages');

        jQuery.ajax({
            type: "POST",
            url: sendMessage,
            data: {
                replyId: self.replyId,
                senderId: self.userId,
                text: text
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_success) {
                    msg = data.data;
                    self.messages.unshift(msg); // add new message to list of messages
                    self.chatInput.val(''); // reset chat textbox after sending
                    self.renderMessages(true);
                } else {
                    console.error(data);
                    alert(data.message);
                }
            }
        });
    }

    /**
     * Loads history of chat by retrieving all messages prior to this.firstId (ID of the first message on screen).
     */
    loadHistory() {
        let messages = [];
        let getMessages = jbdUtils.getAjaxUrl('getMessagesAjax', 'requestquotemessages');
        let self = this;

        self.chatLoading.show();
        jQuery.ajax({
            type: "POST",
            url: getMessages,
            data: {
                replyId: self.replyId,
                firstId: self.firstMsgId
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_success) {
                    messages = data.data;
                    self.renderMessages(false, messages);

                    self.chatLoading.hide();
                } else {
                    console.error(data);
                    alert(data.message);
                }
            }
        });
    }

    /**
     * Function that calls endpoint to see if new messages are available. If so, renders them on screen.
     */
    pollMessages() {
        let self = this;

        let getMessages = jbdUtils.getAjaxUrl('getMessagesAjax', 'requestquotemessages');

        jQuery.ajax({
            type: "POST",
            url: getMessages,
            data: {
                replyId: self.replyId,
                lastId: self.lastMsgId
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_success) {
                    if (data.data.length > 0) {
                        self.messages = data.data;
                        self.renderMessages(true);
                    }
                } else {
                    console.error(data);
                    alert(data.message);
                }
            }
        });
    }

    /**
     * Opens the chat modal. Chat modal HTML must be present on the page.
     *
     * If chat is initialized through modal, chat body HTML is retrieved by call to endpoint.
     *
     * @param replyId int ID of the reply quote
     * @param userId int ID of the sender
     * @param options array of options
     *        [
     *          allowSend => if false, will disable possibility to send message
     *        ]
     *
     */
    openModal(replyId, userId = null, options = null) {
        let modal = jQuery('#quote-request-messages-modal');

        modal.jbdModal();

        let self = this;

        //retrieve the HTML for the chat body
        let getChat = jbdUtils.getAjaxUrl('getChatHtmlAjax', 'requestquotemessages');

        jQuery.ajax({
            type: "POST",
            url: getChat,
            data: {
                replyId: replyId
            },
            dataType: 'json',
            cache:false,
            success: function (data) {
                if (data.status == self.response_success) {
                    modal.find('.jmodal-body').html(data.data);
                    self.init(replyId, userId, options);
                } else {
                    console.error(data);
                    alert(data.message);
                }
            }
        });

        // if modal is closed, clear instance
        modal.on(jQuery.jbdModal.BEFORE_CLOSE, function () {
            self.clearInstance();
        });
    }

    /**
     * Resets the current active chat instance.
     */
    clearInstance() {
        this.replyId = null;
        this.userId = null;
        this.allowSend = false;
        this.messages = [];
        this.lastMsgId = 0;
        this.firstMsgId = 0;

        this.chatContainer = null;
        this.chatInput = null;
        this.chatSendBtn = null;
        this.chatLoading = null;
        this.chatBody = null;
        this.chatFooter = null;

        clearInterval(this.interval);

        this.interval = null;

        jQuery('#quote-request-messages-modal').find('.modal-body').html('')
    }
}

let jbdQuoteMessages = new JBDQuoteMessages();



function addFilterActivityCountry(type, id) {
    jQuery("#country-search").val(id);
    jQuery("#adminForm input[name=limitstart]").val(0);
    jbdUtils.saveSelectedCategory();
    jQuery("#adminForm").submit();
}

function addNewMember(index,MemberFolder,MemberFolderPath) {
    var newMemId = parseInt(index) + 1;
    jQuery('#member-form-box1').clone().prop('id', 'member-form-box' + newMemId).appendTo('#member_details');
    jQuery("#member-form-box" + newMemId).find('h3').text(Joomla.JText._('LNG_MEMBER') + ' ' + newMemId);
    jQuery('#member-form-box' + newMemId + ' input').each(function () {
        jQuery(this).val('');
    });
    jQuery('#member-form-box' + newMemId + ' textarea').each(function () {
        jQuery(this).html('');
    });

    jQuery('#member-form-box' + newMemId + ' textarea').val('');
    jQuery('#member-form-box' + newMemId + ' .input-imageLocation').prop('id', 'member-imageLocation' + newMemId);
    jQuery('#member-form-box' + newMemId + ' .input-imageLocationSize').prop('id', 'member-imageUploader' + newMemId);

    var options = jQuery("#member-form-box1 #member_type_1").clone();
    jQuery("#member-form-box"+newMemId+" #member_type1_chzn").remove();
    jQuery("#member-form-box"+newMemId+" #member_type_select").append(options);
    jQuery("#member-form-box"+newMemId+" #member_type1").removeAttr('onchange');
    jQuery('.chosen-select').chosen({disable_search_threshold: 5,search_contains:false});

    jQuery('#member-form-box' + newMemId + ' .services').prop('id', 'member-picture-preview' + newMemId);
    jQuery('#member-picture-preview' + newMemId).html('');

    jQuery('#member-form-box' + newMemId + ' #memberImageSection').find('a').prop('href', 'javascript:removeMemberLogo('+ newMemId +')');

    jQuery("#member-form-box" + newMemId + " .remove-member").attr('href', 'javascript:removeMember(\'' + newMemId + '\')').show();
    jQuery('#add_member').attr('onclick', 'addNewMember(\'' + newMemId + '\',\'' + MemberFolder + '\',\'' + MemberFolderPath + '\' )');

    imageUploader(MemberFolder, MemberFolderPath, 'member-',newMemId);

}

function removeMember(index) {
    if (index < 2)
        return;

    index = parseInt(index);
    jQuery('#member-form-box' + index).remove();
}

function removeMemberLogo(id) {
    jQuery('#member-imageLocation'+id).val("");
    jQuery('#member-picture-preview'+id).html("");
    jQuery('#member-imageUploader'+id).val("");
}
