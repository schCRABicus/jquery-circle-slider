(function( $ ){

    $(function(){

        var
            model = {
                'format' : 'decimal',
                'min' : 0,
                'max' : 360,
                'step' : 0.01,
                'value' : 45,
                'prefix' : '',
                'suffix' : '&#176;'
            },

            views = {

                'tabs' : $("#app-tabs"),

                'format' : $("#format-radio"),

                'min' : $("#min-value"),

                'max' : $("#max-value"),

                'value' : $("#current-value"),

                'step' : $("#step-value"),

                'prefix' : $("#prefix-value"),

                'suffix' : $("#suffix-value"),

                'state' : $("#state-radio"),

                'circle_slider' : $("#circle-slider-instance"),

                'codemirror' : $("#code-container")
            },

            controllers = {

                'format_change_listener' : function(){
                    model.format = $(this).find("input[type='radio']:checked").val();
                    controllers.update_circle_slider_instance.call( null );
                },

                'min_value_change_listener' : function(){
                    model.min = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'max_value_change_listener' : function(){
                    model.max = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'step_value_change_listener' : function(){
                    model.step = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'current_value_change_listener' : function(){
                    model.value = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'prefix_value_change_listener' : function(){
                    model.prefix = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'suffix_value_change_listener' : function(){
                    model.suffix = this.value;
                    controllers.update_circle_slider_instance.call( null );
                },

                'state_change_listener' : function(){
                    var v = $(this).find("input[type='radio']:checked").val();

                    switch( v ){
                        case 'enable' :
                            views.circle_slider.circleSlider( 'enable' );
                            break;

                        case 'disable' :
                            views.circle_slider.circleSlider( 'disable' );
                            break;

                        default:
                            return;
                    }
                },

                'update_circle_slider_instance' : function(){
                    views.circle_slider.circleSlider( 'destroy' );
                    initializers.circle_slider_initializer.call( null );
                },

                'update_source' : function(){
                    codemirror.setOption( "value" , source_builder.build_source( model.format ) );
                    codemirror.refresh();
                }

            },

            initializers = {

                'tabs_initializer' : function(){
                    views.tabs.tabs({
                        'activate' : function( e , ui ){
                            if ( ui && ui.newPanel && ui.newPanel.attr("id") === "source-tab" ){
                                controllers.update_source();
                            }
                        }
                    });
                },

                'format_initializer' : function(){
                    views.format.buttonset().change( controllers.format_change_listener );
                },

                'min_initializer' : function(){
                    views.min.val( model.min ).change( controllers.min_value_change_listener );
                },

                'max_initializer' : function(){
                    views.max.val( model.max ).change( controllers.max_value_change_listener );
                },

                'step_initializer' : function(){
                    views.step.val( model.step ).change( controllers.step_value_change_listener );
                },

                'value_initializer' : function(){
                    views.value.val( model.value ).change( controllers.current_value_change_listener );
                },

                'prefix_initializer' : function(){
                    views.prefix.val( model.prefix ).change( controllers.prefix_value_change_listener );
                },

                'suffix_initializer' : function(){
                    views.suffix.val( model.suffix ).change( controllers.suffix_value_change_listener );
                },

                'state_initializer' : function(){
                    views.state.buttonset().change( controllers.state_change_listener );
                },

                'circle_slider_initializer' : function(){
                    views.circle_slider.circleSlider({
                        'format' : model.format,
                        'min' : model.min,
                        'max' : model.max,
                        'step' : model.step,
                        'value' : model.value,
                        'prefix' : model.prefix,
                        'suffix' : model.suffix
                    });
                },

                'codemirror_initializer' : function(){
                    codemirror = CodeMirror( views.codemirror[0] , {
                        value: "",
                        mode:  "javascript",
                        json: true,
                        theme: "eclipse",
                        lineNumbers : true,
                        readOnly : true
                    });

                }
            },

            source_builder,

            codemirror,

            i;

        /*
        Initializing all fields and listeners...
         */
        for ( i in initializers ){
            if ( initializers.hasOwnProperty( i ) ){
                initializers[ i ].call( null );
            }
        }

        source_builder = (function(){

            var
                /**
                 * List of all supported formats and options, taken into account for each format;
                 *
                 * @private
                 * @type {Object}
                 */
                _supported_formats = {
                    'integer' : {
                        'options' : [
                            'format',
                            'value',
                            'prefix',
                            'suffix'
                        ]
                    },
                    'decimal' : {
                        'options' : [
                            'format',
                            'value',
                            'prefix',
                            'suffix'
                        ]
                    },
                    'range' : {
                        'options' : [
                            'format',
                            'min',
                            'max',
                            'step',
                            'value',
                            'prefix',
                            'suffix'
                        ]
                    }
                },

                /**
                 * Builds a string representation for option;
                 *
                 * @private
                 * @method _build_option_row
                 * @param option {String} Option name;
                 * @param first_option {Boolean} Indicates whether it's the first option ( it's necessary only for formatting purposes );
                 * @return String
                 */
                _build_option_row = function( option , first_option ){
                    return ( first_option ? '' : ',' ) + '\n\t' + option + ' : "' + ( model.hasOwnProperty( option ) ? model[ option ] : '' ) + '"';
                },

                /**
                 * Builds source for the specified format;
                 *
                 * @public
                 * @method build_source
                 * @param format {String} Current format;
                 * @return String
                 */
                build_source = function( format ){
                    var h = 'jQuery( "selector" ).circleSlider({',
                        k;

                    format = _supported_formats.hasOwnProperty( format ) ? format : 'integer' ;

                    $.each( _supported_formats[format].options , function( i , o ){
                        h += _build_option_row( o , i == 0 );
                    });
                    h += '\n});';

                    return h;
                };

            return {
                build_source : build_source
            }
        })();

    });

})( jQuery );