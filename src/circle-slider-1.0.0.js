/**
 * @module circle-slider
 * @author schCRABicus@gmail.com
 * @version 1.0
 *
 * @description Circle slider jQuery plugin;
 *              This plugin provides a circle-view slider, which can be used to select angles or something related to it;
 *              Also, a range can be specified;
 */
(function( $ ){

    $.fn.circleSlider = function( methodOrOptions ){
        if ( methods[ methodOrOptions ] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.circleSlider' );
        }
    };

    var methods = {

        value : function(){
            var el = CircleSlider.get_instance( this),
                args = Array.prototype.slice.call( arguments, 0 );

            if ( el ){
                if ( args.length ){
                    /* ... setter ... */
                    el.setValue( Number( args[0] ) );
                } else {
                    /* ... getter ... */
                    return el.getValue();
                }
            }
        },

        destroy : function(){
            var el = CircleSlider.get_instance( this);

            if ( el ){
                el.destroy();
            }
        },

        disable : function(){
            var el = CircleSlider.get_instance( this);

            if ( el ){
                el.disable();
            }
        },

        enable : function(){
            var el = CircleSlider.get_instance( this);

            if ( el ){
                el.enable();
            }
        },

        start : function( fn ){
            var el = CircleSlider.get_instance( this);

            if ( el && typeof fn === "function" ){
                el.onStart( fn );
            }
        },

        stop : function( fn ){
            var el = CircleSlider.get_instance( this);

            if ( el && typeof fn === "function" ){
                el.onStop( fn );
            }
        },

        slide : function( fn ){
            var el = CircleSlider.get_instance( this);

            if ( el && typeof fn === "function" ){
                el.onSlide( fn );
            }
        },

        change : function( fn ){
            var el = CircleSlider.get_instance( this);

            if ( el && typeof fn === "function" ){
                el.onChange( fn );
            }
        },

        init : function( o ){
            o = o || {};
            o.element = this;

            CircleSlider.create_instance( o );
        }

    };

    /**
     * Constructor for CircleSlider;
     *
     * @class CircleSlider
     * @constructor
     */
    function CircleSlider(){

        // private properties and functions...
        var
            /**
             * A set of observers;
             *
             * @private
             * @property
             * @type {{}}
             */
            _observers = {},

            /**
             * Adds an observer, listening to the specified event;
             *
             * @private
             * @method addObserver
             * @param type {String} Event type to listen to;
             * @param fn {Function} Callback to be called on event triggering;
             */
            _add_observer = function( type , fn ){
                type = type || 'all';

                if ( typeof fn === "function" ){
                    if ( !_observers.hasOwnProperty( type ) ){
                        _observers[ type ] = [];
                    }
                    _observers[ type ].push( fn );
                }
            },

            /**
             * Clears all observers;
             *
             * @private
             * @method _clear_observers
             */
            _clear_observers = function(){
                _observers = {};
            },

            /**
             * Notifies observer of the specified type;
             *
             * @private
             * @method _notify_observer
             * @type {String} Event type observers to be notified about;
             */
            _notify_observer = function( type ){
                var args = Array.prototype.slice.call( arguments , 1),
                    i, l;

                type = type || "all";
                for ( i = 0 , l = _observers[type] ? _observers[type].length : 0 ; i < l ; i++ ){
                    _observers[type][i].apply( this , args );
                }
            };

        /**
         * A set of instance options;
         *
         * @property
         * @type {Object}
         */
        this.options = {};

        /**
         * jQuery DOM references to plugin elements;
         *
         * @property
         * @type {{outer_circle: null, inner_circle: null, control_element: null, value_prefix_element: null, value_element: null, value_suffix_element: null}}
         */
        this.view = {
            outer_circle : null,
            inner_circle : null,
            control_element : null,
            value_prefix_element : null,
            value_element : null,
            value_suffix_element : null
        };

        /**
         * Plugin offset value;
         *
         * @property
         * @type {*}
         */
        this.plugin_offset = null;

        /**
         * Inner circle offset;
         *
         * @property
         * @type {*}
         */
        this.inner_offset = null;

        /**
         * Plugin width;
         *
         * @property
         * @type {*}
         */
        this.plugin_width = null;

        /**
         * Plugin height;
         *
         * @property
         * @type {*}
         */
        this.plugin_height = null;

        /**
         * Coordinates of the center of the circle;
         *
         * @property
         * @type {{x: number, y: number}}
         */
        this.center = {};

        /**
         * Margins of the control element;
         *
         * @property
         * @type {{x: number, y: number}}
         */
        this.control_margin = {};

        /**
         * Radius of the circle control element can move on;
         *
         * @property
         * @type {{x: number, y: number}}
         */
        this.radius = {};

        /**
         * Reference to the document element;
         *
         * @type {*|HTMLElement}
         */
        this.doc = $(document);

        /**
         * Current slider value;
         *
         * @property
         * @type {number}
         */
        this.value = 0;

        /**
         * Calculations accuracy;
         *
         * @property
         * @type {number}
         */
        this.accuracy = 0;

        /**
         * Function used to transform the current value in degrees to the format-corresponding one;
         *
         * @method
         * @type {Function}
         */
        this.degrees_to_value_transformer = this.integerToValueTransformer;

        /**
         * Function used to transform the current value in degrees to the format-corresponding one;
         *
         * @method
         * @type {Function}
         */
        this.value_to_degrees_transformer = this.integerFromValueTransformer;

        /**
         * Indicates whether the plugin is enabled at the moment;
         *
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Triggers the specified event;
         *
         * @public
         * @method trigger_event
         * @param type {String} Event type to be triggered;
         */
        this.trigger_event = function( type ){
            _notify_observer.apply( this, arguments );
        };

        /**
         * Adds observer to 'start' event;
         * This event gets triggered when the circle slider starts dragging;
         *
         * @param fn {Function} Callback to execute on start event;
         */
        this.onStart = function( fn ){
            _add_observer( "start" , fn );
        };

        /**
         * Adds observer to 'stop' event;
         * This event gets triggered when the circle slider stops dragging;
         *
         * @param fn {Function} Callback to execute on stop event;
         */
        this.onStop = function( fn ){
            _add_observer( "stop" , fn );
        };

        /**
         * Adds observer to 'slide' event;
         * This event gets triggered on every slider drag event;
         *
         * @param fn {Function} Callback to execute on slide event;
         */
        this.onSlide = function( fn ){
            _add_observer( "slide" , fn );
        };

        /**
         * Adds observer to 'slide' event;
         * This event gets triggered on every change event, which is caused programmatically;
         *
         * @param fn {Function} Callback to execute on change event;
         */
        this.onChange = function( fn ){
            _add_observer( "change" , fn );
        };

    }

    /**
     * Plugin initializer;
     *
     * @public
     * @method init
     * @param o {Object} Initial options;
     */
    CircleSlider.prototype.init = function( o ){
        var t ;

        if ( !o.element || o.element.length == 0 ){
            $.error( 'Target element is not specified.' );
        }
        o.id = o.element.attr("id");
        if ( !o.id ){
            while ( CircleSlider.cached_instances.hasOwnProperty(t = (new Date().getDate().toString()))){}
            o.id = t;
        }
        o.element.attr("data-circle-slider-id", o.id);
        this.options = $.extend( {}, CircleSlider.default_options , o );

        this.options.element.append( CircleSlider.build_html( this.options.id ) );
        this.degrees_to_value_transformer = this[ this.options.format + "ToValueTransformer" ] || this[ "integerToValueTransformer" ];
        this.value_to_degrees_transformer = this[ this.options.format + "FromValueTransformer" ] || this[ "integerFromValueTransformer" ];

        /* ... initializing views ...*/
        this.view.outer_circle = $("#circle-slider-outer-circle-" + this.options.id);
        this.view.inner_circle = $("#circle-slider-inner-circle-" + this.options.id);
        this.view.control_element = $("#circle-slider-control-element-" + this.options.id);
        this.view.value_prefix_element = $("#circle-slider-slider-value-prefix-" + this.options.id);
        this.view.value_element = $("#circle-slider-slider-value-" + this.options.id);
        this.view.value_suffix_element = $("#circle-slider-slider-value-suffix-" + this.options.id);

        this.view.value_prefix_element.html( this.options.prefix );
        this.view.value_suffix_element.html( this.options.suffix );

        this.adjustOptions();
        /* value check */
        {
            this.calculateAccuracy();
            var d = {
                    min : this.options.min,
                    max : this.options.max,
                    step : this.options.step,
                    value : this.options.value,
                    accuracy : this.accuracy
                },
                err;

            /* at first, checking range bounds presence nad validity ... */
            err = CircleSlider.validator.validate( { 'value_1' : 'range_bound_presence' , 'value_2' : 'range_max_min' } , { 'value_1' : d , 'value_2' : d });
            if ( err.length !== 0 ){
                d.min = this.options.min = CircleSlider.default_options.min;
                d.max = this.options.max = CircleSlider.default_options.max;
                CircleSlider.validator.printErrors();
            }

            /* ... then - step validity ... */
            err = CircleSlider.validator.validate( { 'value' : 'range_step' } , { 'value' : d });
            if ( err.length !== 0 ){
                d.step = this.options.step = Math.min( CircleSlider.default_options.step , this.options.max - this.options.min );
                CircleSlider.validator.printErrors();
            }

            /* .. and finally validating initial value... */
            err = CircleSlider.validator.validate( { 'value' : 'value_in_range' } , { 'value' : d });
            if ( err.length !== 0 ){
                this.options.value = this.options.min;
                CircleSlider.validator.printErrors();
            }
        }
        this.calculateAccuracy();
        this.view.value_element.html( this.options.value );
        this.setValue( this.options.value );

        this.bindNativeCallbacks();
        this.bindCustomCallbacks();
        this.bindHandlers();
    };

    /**
     * Adjusts current options;
     * Since the minimum value, maximum value and step value are taken into account only for 'range'
     * format, we have to set the default options for format, not equal to 'range';
     *
     * @public
     * @method adjustOptions
     */
    CircleSlider.prototype.adjustOptions = function(){
        this.options.min = Number(this.options.min);
        this.options.max = Number(this.options.max);
        this.options.step = Number(this.options.step);

        if ( this.options.format != "range" ){
            this.options.min = CircleSlider.default_options.min;
            this.options.max = CircleSlider.default_options.max;
            this.options.step = CircleSlider.default_options.step;
        }
    };

    /**
     * Binds all the specified by the user event listeners;
     *
     * @public
     * @method bindCallbacks
     */
    CircleSlider.prototype.bindCustomCallbacks = function(){

        var self = this,
            o = this.options,
            supported_events = [
                "Start",
                "Stop",
                "Slide",
                "Change"
            ];

        $.each( supported_events , function( i, e ){
            if (o.hasOwnProperty(e.toLowerCase() )){
                self["on" + e].call( self , o[ e.toLowerCase() ]);
            }
        });
    };

    /**
     * Binds native callbacks;
     * These callbacks include :
     *  - on slide event - current value updating;
     *  - on change event - current value updating;
     *  - on start event - adding 'state-active' class to control element;
     *  - on stop event - remove 'state-active' class from control element and adjusting current value;
     *
     * @public
     * @method bindNativeCallbacks
     */
    CircleSlider.prototype.bindNativeCallbacks = function(){
        var self = this;

        this.onStart( function(){
            self.view.control_element.addClass( "state-active" );
        });
        this.onStop( function(){
            self.view.control_element.removeClass( "state-active" );
            self.setValue( self.value );
        });
        this.onSlide( this.valueUpdater );
        this.onChange( this.valueUpdater );
    };

    /**
     * Updates the current value and representation with the new value with respect to the plugin format;
     *
     * @public
     * @method integerValueUpdater
     * @param v {Number} Current plugin value;
     */
    CircleSlider.prototype.valueUpdater = function( v ){
        this.view.value_element.html( this.value = this.degrees_to_value_transformer.call( this , v ) );
    };

    /**
     * Transforms the current value, rounding it to the integer, closest to the current slider value;
     *
     * @public
     * @method integerToValueTransformer
     * @param v {Number} Current plugin value;
     * @return {Number} Rounded to the closest integer value;
     */
    CircleSlider.prototype.integerToValueTransformer = function( v ){
        return Math.round( v );
    };

    /**
     * Transforms the current value, rounding it to two decimal places;
     *
     * @public
     * @method decimalToValueTransformer
     * @param v {Number} Current plugin value;
     * @return {Number} Rounded to two decimal places value;
     */
    CircleSlider.prototype.decimalToValueTransformer = function( v ){
        return Math.round( v * 100 ) / 100;
    };

    /**
     * Transforms the current value in degrees to value from range, rounding it to the nearest value in the range;
     *
     * @public
     * @method rangeValueTransformer
     * @param v {Number} Current plugin value;
     * @return {Number} Rounded to the nearest value in the range value;
     */
    CircleSlider.prototype.rangeToValueTransformer = function( v ){
        return Math.round(
            ( this.options.min +
                this.options.step *
                    ( Math.round
                        (
                            v / 360 *
                            ( ( this.options.max - this.options.min ) / this.options.step + 1 )
                        ) % ( ( this.options.max - this.options.min ) / this.options.step + 1 )
                    )
            ) * Math.pow( 10 , this.accuracy)
        ) / Math.pow( 10 , this.accuracy) ;
    };

    /**
     * Transforms the value to degrees;
     *
     * @public
     * @method abstractFromValueTransformer
     * @param v {Number} Value to be transformed to degrees;
     * @return {Number} Value in degrees;
     */
    CircleSlider.prototype.abstractFromValueTransformer = function( v ){
        return v;
    };

    CircleSlider.prototype.integerFromValueTransformer = CircleSlider.prototype.abstractFromValueTransformer;
    CircleSlider.prototype.decimalFromValueTrasformer = CircleSlider.prototype.abstractFromValueTransformer;

    /**
     * Transforms value from the specified range to the corresponding degrees;
     * It's calculated in the following way :
     *      let a - required angle in degrees,
     *          v - given value;
     *
     *      Then, the following equality takes the place :
     *
     *      a / 360 = ( ( (v - min)/step ) % ( (max - min)/step + 1 ) ) / ( (max - min)/step + 1 );
     *
     * @public
     * @method rangeFromValueTransformer
     * @param v {Number} Value to be transformed to degrees;
     * @return {Number} Value in degrees;
     */
    CircleSlider.prototype.rangeFromValueTransformer = function( v ){
        return 360 * ( ( ( v - this.options.min ) / this.options.step ) % ( (this.options.max - this.options.min) / this.options.step + 1) ) / ( (this.options.max - this.options.min) / this.options.step + 1);
    };

    /**
     * Mouse event handler;
     *
     * @public
     * @method bindHandlers
     */
    CircleSlider.prototype.bindHandlers = function(){
        var self = this;

        this.view.control_element.on( 'mousedown', function( e ){
            e.preventDefault();
            if ( !self.enabled ) return;

            self.recalculatePositions();
            self.trigger_event( "start" );
            self.doc.on( 'mousemove.crlslr' , function( e ){
                var y = self.center.y - e.pageY,
                    x = self.center.x - e.pageX,
                    deg = 180 - Math.atan2(y,x)*CircleSlider.radian_to_degree_coeff;

                if (deg >= 360 ){
                    deg = deg % 360;
                }

                self.updateControlPosition( deg );
                self.trigger_event( "slide" , deg );
            });

            self.doc.on( 'mouseup.crlslr' , function( ){
                self.doc.off( '.crlslr' );
                self.trigger_event( "stop" );
            });

        });
    };

    /**
     * Recalculates the dimensions and positions of the elements;
     * It's necessary to recalculate them because user can change browser size,
     * but control position relies on these values;
     *
     * @public
     * @method recalculatePositions
     */
    CircleSlider.prototype.recalculatePositions = function(){
        this.plugin_width = this.view.outer_circle.width();
        this.plugin_height = this.view.outer_circle.height();
        if( this.options.element.is(":visible") ){
            this.plugin_offset = this.view.outer_circle.offset();
            this.inner_offset = this.view.inner_circle.offset();
            this.center = {
                x : this.plugin_offset.left + this.plugin_width/2,
                y : this.plugin_offset.top + this.plugin_height/2
            };
            this.control_margin = {
                x : this.inner_offset.left - this.plugin_offset.left,
                y : this.inner_offset.top - this.plugin_offset.top
            };
            this.radius = {
                x : this.plugin_width - this.control_margin.x,
                y : this.plugin_height - this.control_margin.y
            };
        } else {
            this.inner_offset = {
                left : parseInt( this.view.inner_circle.css("left") , 10),
                top : parseInt( this.view.inner_circle.css("top") , 10 )
            };
            this.control_margin = {
                x : this.inner_offset.left,
                y : this.inner_offset.top
            };
            this.radius = {
                x : this.plugin_width - this.control_margin.x,
                y : this.plugin_height - this.control_margin.y
            };
        }

    };

    /**
     * Sets the specified value to plugin;
     *
     * @public
     * @method setValue
     * @param v {Number} Value to be set;
     */
    CircleSlider.prototype.setValue = function( v ){

        var d = {
                min : this.options.min,
                max : this.options.max,
                step : this.options.step,
                accuracy : this.accuracy,
                value : v
            },
            err = CircleSlider.validator.validate( { 'value' : 'value_in_range' } , { 'value' : d }),
            r;

        if ( err.length == 0 ){
            v = this.value_to_degrees_transformer( v );
            this.recalculatePositions();
            this.trigger_event( "change" , v );
            this.updateControlPosition( v );
        } else {
            for ( r in err ){
                if ( err.hasOwnProperty( r )){
                    console.error( err[ r ] );
                }
            }
        }

    };

    /**
     * Updates control position according to the current angle degree;
     *
     * @public
     * @method updateControlPosition
     * @param deg {Number} Angle value in degrees;
     */
    CircleSlider.prototype.updateControlPosition = function( deg ){
        this.view.control_element.css({
            left : this.radius.x/2 * ( 1 + Math.cos( deg * Math.PI / 180) ),
            top : this.radius.y/2 * ( 1 - Math.sin( deg * Math.PI / 180))
        });
    };

    /**
     * Gets current plugin value;
     *
     * @public
     * @method getValue
     * @return {Number} Current plugin value;
     */
    CircleSlider.prototype.getValue = function(){
        return this.value;
    };

    /**
     * Calculates the accuracy to be taken into account on value updating;
     * The accuracy is calculated according to the specified step;
     *
     * @public
     * @method calculateAccuracy
     */
    CircleSlider.prototype.calculateAccuracy = function(){
        var s = this.options.step,
            max_period = 5,
            a = 0;

        while ( a < max_period ){
            if ( s * Math.pow( 10 , a) == Math.round( s * Math.pow( 10 , a) ) ){
                this.accuracy = a;
                return;
            }
            a++;
        }
    };

    /**
     * Removes the slider functionality completely. This will return the element back to its pre-init state.
     *
     * @public
     * @method destroy
     */
    CircleSlider.prototype.destroy = function(){
        var o = this.options,
            id = o ? o.id : null,
            p = o ? o.element : null;

        if( id ) delete CircleSlider.cached_instances[ id ];
        if( p ) p.empty();

    };

    /**
     * Disables the slider.
     *
     * @public
     * @method disable
     */
    CircleSlider.prototype.disable = function(){
        this.enabled = false;
        this.view.control_element.addClass( "state-disabled" );
    };

    /**
     * Enables the slider.
     *
     * @public
     * @method disable
     */
    CircleSlider.prototype.enable = function(){
        this.enabled = true;
        this.view.control_element.removeClass( "state-disabled" );
    };

    /**
     * A set of default options;
     *
     * @static
     * @property default_options
     * @type {{min: number, max: number, radius: number, value: number}}
     */
    CircleSlider.default_options = {
        min : 0,
        max : 359,
        step : 0.01,
        value : 0,
        prefix : "",
        suffix : "",
        format : "integer"  // other supported formats : decimal - decimal values, range - integer values in the 'min-max' range
    };

    /**
     * Constructs html for circle slider;
     *
     * @public
     * @static
     * @method build_html
     * @param id {String} Unique element identifier;
     * @returns {string} Html markup;
     */
    CircleSlider.build_html = function( id ){
        var h = "";

        h += "<div id='circle-slider-outer-circle-" + id + "' class='ui-circle-slider outer-circle'>" +
                "<div id='circle-slider-inner-circle-" + id + "' class='ui-circle-slider inner-circle'>" +
                    "<span id='circle-slider-slider-value-prefix-" + id + "' class='ui-circle-slider slider-value-prefix'></span>" +
                    "<span id='circle-slider-slider-value-" + id + "' class='ui-circle-slider slider-value'></span>" +
                    "<span id='circle-slider-slider-value-suffix-" + id + "' class='ui-circle-slider slider-value-suffix'></span>" +
                "</div>" +
                "<div id='circle-slider-control-element-" + id + "' class='ui-circle-slider control-element'></div>" +
            "</div>";

        return h;
    };

    /**
     * Static factory method to create CircleSlider instances;
     *
     * @public
     * @static
     * @method create_instance
     * @param o {Object} Plugin options;
     * @returns {CircleSlider} Initialized CircleSlider instance;
     */
    CircleSlider.create_instance = function( o ){
        var instance = new CircleSlider();

        instance.init( o );
        CircleSlider.cached_instances[ instance.options.id ] = instance;

        return instance;
    };

    /**
     * Retrieves the cached instance of the plugin for the specified element;
     * This element has to have 'data-circle-slider-id' attribute, storing instance id;
     *
     * @public
     * @static
     * @param owner {jQuery} Owner element the CircleSlider is bind to;
     * @return {CircleSlider} Related CircleSlider instance;
     */
    CircleSlider.get_instance = function( owner ){
        var instance = null,
            id;

        if ( owner && owner.length ){
            id = owner.attr ? owner.attr('data-circle-slider-id') : null;
            if ( id ){
                instance = CircleSlider.cached_instances[ id ];
            }
        }

        return instance;
    };

    /**
     * Radian to degree multiplier;
     *
     * @static
     * @type {number}
     */
    CircleSlider.radian_to_degree_coeff = 180/Math.PI;

    /**
     * Stores instances, related to elements;
     * A key is an element id, a value - corresponding CircleSlider instance;
     *
     * @static
     * @property
     * @type {{}}
     */
    CircleSlider.cached_instances = {};

    /**
     * Static validator;
     *
     * @public
     * @static
     * @type {{types: {range: {validate: Function, instructions: string}, range_max_min: {}, range_step: {}, value_in_range: {}}, validate: Function}}
     */
    CircleSlider.validator = {

        errors : [],

        types : {


            /**
             * Validates range by simply checking bound presence;
             */
            range_bound_presence : {

                /**
                 * Checks whether both upper and bottom values are specified;
                 *
                 * @param data {Object} Data to be validated;
                 * @returns {boolean}
                 */
                validate : function( data ){
                    var min = data ? data.min : null,
                        max = data ? data.max : null;

                    return min != null && max != null;
                },

                instructions : "Maximum or minimum value in range is not specified."
            },

            /**
             *  Checks range validity - up bound can't be less then bottom bound
             */
            range_max_min : {

                /**
                 * Checks whether the upper bound is greater than lower;
                 *
                 * @param data {Object} Data to be validated;
                 * @returns {boolean}
                 */
                validate : function( data ){
                    var min = data ? data.min : null,
                        max = data ? data.max : null;

                    return min != null && max != null && max > min;
                },

                instructions : "The upper bound can't be less than the bottom one."
            },

            /**
             * Validates step - whether the range can be covered with the integer number of steps;
             */
            range_step : {

                /**
                 * Checks that the specified range can be covered with the integer number of the specified steps;
                 *
                 * @param data {Object} Data to be validated;
                 * @returns {boolean}  True if range can be covered with the integer number of steps and false otherwise;
                 */
                validate : function( data ){
                    var min = data ? data.min : null,
                        max = data ? data.max : null,
                        step = data ? data.step : null,
                        accuracy = data ? data.accuracy : null;

                    this.instructions = "Range [ " + min + " ; " + max + " ] can't be covered with the integer number of the specified steps : " + step + ".";
                    return min != null && max != null && step != null && ( ( Math.round( ( max - min ) / step * Math.pow( 10 , accuracy + 1 ) ) /  Math.pow( 10 , accuracy + 1 ) % 1 ) == 0 );

                },

                instructions : "The specified range can't be covered with the integer number of the specified steps."

            },

            /**
             * Checks whether the entered value is in the specified range and fits the step;
             */
            value_in_range : {

                /**
                 * Checks whether the value resides in the specified range and can be targeted with the integer number of steps;
                 *
                 * @param data {Object} Data to be validated;
                 * @returns {boolean} True if value resides in the specified range and can be targeted with the integer number of steps and false otherwise;
                 */
                validate : function( data ){
                    var min = data ? data.min : null,
                        max = data ? data.max : null,
                        step = data ? data.step : null,
                        value = data ? data.value : null,
                        accuracy = data ? data.accuracy : null;

                    this.instructions = "Value " + value + " doesn't lie in range [ " + min + " ; " + max + " ] , covered by step = " + step + ".";
                    return min != null && max != null && step != null && ( value >= min ) && ( value <= max ) && ( ( Math.round( ( ( value - min ) / step ) * Math.pow( 10 , accuracy + 1 ) ) / Math.pow( 10 , accuracy + 1 ) % 1 ) == 0 );
                },

                instructions : "The specified value doesn't lie in the initial range."
            }
        },

        /**
         * Validates the data, specified by the config;
         *
         * @param config
         * @param data
         * @return {Array} The list of errors;
         */
        validate : function( config , data ){

            var k , type , validator, res;

            CircleSlider.validator.errors = [];
            for ( k in config ){
                if ( config.hasOwnProperty( k ) ){
                    type = config[ k ];
                    validator = CircleSlider.validator.types[ type ];

                    if ( !type ){
                        continue;
                    }
                    if ( !validator ){
                        $.error("The validator of type " + type + " doesn't exist.");
                    }

                    res = validator.validate( data[ k ] );
                    if ( !res ){
                        CircleSlider.validator.errors.push( validator.instructions );
                    }
                }
            }

            return CircleSlider.validator.errors;
        },

        /**
         * Gets the list of the errors, occurred during the last validation;
         *
         * @public
         * @static
         * @returns {*}
         */
        getErrors : function(){
            return CircleSlider.validator.errors;
        },

        /**
         * Prints errors;
         *
         * @public
         * @static
         */
        printErrors : function(){
            var i = 0,
                e = this.errors,
                l = e.length;

            for ( i ; i < l ; i++ ){
                console.error( e[ i ] );
            }
        }
    }

}( jQuery ));