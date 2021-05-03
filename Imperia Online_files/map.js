var map = map || (function () {

    function MapException(message) {
        this.message = message;
        this.stack = (new Error()).stack;
    }

    MapException.prototype = Object.create(Error.prototype);
    MapException.prototype.name = 'MapException';
    MapException.prototype.constructor = MapException;

    /**
     * Keys for decoding the map response
     * @type {any}
     */
    var mapResponseDecodeKeys = {
        'D': 6,
        'I': 7,
        'Y': 8,
        'A': 9,
        'N': 10
    };

    /**
     * Decodes an encoded map response using the mapResponseDecodeKeys
     * @param response
     * @returns {any}
     */
    function decodeMapResponse(response) {
        var k = 0;
        var p = 0;
        var decoded = '';
        var responseLength = response.length;
        while (k < responseLength - 1) {
            p = mapResponseDecodeKeys[response.substr(k, 1)];
            decoded += response.substr(k + 1, p);
            k += p + 1;
        }
        return JSON.parse(atob(decoded));
    }

    /**
     * Returns the has code representation of a string
     * @returns {number}
     */
    String.prototype.hashCode = function() {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    /**
     * Creates a dashed line between two points
     * @param x1 - x coordinate of the first point
     * @param y1 - y coordinate of the first point
     * @param x2 - x coordinate of the second point
     * @param y2 - y coordinate of the second point
     * @param dashLen - the length of the dash and the space between dashes
     * @returns {createjs.Graphics}
     */
    createjs.Graphics.prototype.dashedLineTo = function(x1 , y1 , x2 , y2 , dashLen) {
        this.moveTo(x1 , y1);

        var dX = x2 - x1;
        var dY = y2 - y1;
        var dashes = Math.ceil(Math.sqrt(dX * dX + dY * dY) / dashLen);
        var dashX = Math.round(dX / dashes);
        var dashY = Math.round(dY / dashes);

        var q = 0;
        while(q++ < dashes){
            x1 += dashX;
            y1 += dashY;
            this[q % 2 === 0 ? 'moveTo' : 'lineTo'](x1, y1);
        }
        this[q % 2 === 0 ? 'moveTo' : 'lineTo'](x2, y2);
        return this;
    };

    /**
     * Terminology:
     *
     * x, y -> x and y are the `game coordinates` on the map - the coordinates that are displayed to players
     * their ranges are:
     * x is between mapConstants.minX and mapConstants.maxX
     * and y is between mapConstants.minY and mapConstants.maxY
     * a.k.a `gc`
     *
     * bx, by -> b stands for block. These are the `block coordinates`
     * They are the coordinates of the block in the block matrix
     * the game map is divided into 200 x 200 matrix of blocks
     * each block consisting of 10 x 10 `game coordinates`
     * blocks are used to load all objects in one
     * a.k.a `bc`
     *
     * cx, cy -> c stands for canvas. These are the `canvas coordinates`
     * They are the coordinates in the html canvas that the objects are drawn at
     * a.k.a `cc` and are in pixels
     *
     *
     * globalCx, globalCy -> c stands for canvas. These are the `global canvas coordinates`
     * They are the coordinates of objects based on the whole game map in px.
     * ex: x,y -> globalCx, globalCy   (1000, 200) -> (5k, 1k)
     *
     * quadrant ( quadrantX, quadrantY ) -> the map is divided into 500x500 grid of quadrants for some reason
     * and the minimap search by x/y works by searching quadrants
     *
     */

    // local private constants
    var mapConstants = {
        getBlocksUrl: 'json/dynamic_map_objects.php?',
        configUrls: {
            objectsConfig: 'json/map_config.php',
            actionsConfig: 'json/map_menu_actions.php',
            globalConfig: 'json/map_global.php',
            minimapActionsConfig: 'json/minimap_actions.php'
        },

        assetsForInitialPreload: [
            { id: 'map-status-icon-1', src: 'map_objects/icons/map-status-icon-1.png' },
            { id: 'map-status-icon-2', src: 'map_objects/icons/map-status-icon-2.png' },
            { id: 'map-status-icon-3', src: 'map_objects/icons/map-status-icon-3.png' },
            { id: 'map-status-icon-4', src: 'map_objects/icons/map-status-icon-4.png' },
            { id: 'map-status-icon-5', src: 'map_objects/icons/map-status-icon-5.png' },
            { id: 'map-status-icon-6', src: 'map_objects/icons/map-status-icon-6.png' },
            { id: 'map-status-icon-7', src: 'map_objects/icons/map-status-icon-7.png' },
            { id: 'minimap-object-type-2', src: 'minimap_objects/green_star.png' },
            { id: 'minimap-object-type-3', src: 'minimap_objects/blue_star.png' },
            { id: 'map-card-close', src: 'map_objects/icons/map-card-close.png' }
        ],

        holdingType: {
            userCapital: 1,
            colony: 2
        },

        mapStatusIconPrefix: 'map-status-icon-',

        // the min and max values for the game coordinates
        minX: 0,
        minY: 0,
        maxX: 2000,
        maxY: 2000,

        // The width of one block in game coordinates
        blockWidthGc: 10,
        // The height of one block in game coordinates
        blockHeightGc: 10,
        blockLoadingFactorDefault: 1,

        // The width of the map in game coordinates
        mapWidthGc: 2000,
        // The height of the map in game coordinates
        mapHeightGc: 2000,

        // The x coordinate of the map center in game coordinates
        mapCenterX: 1000,
        // The y coordinate of the map center in game coordinates
        mapCenterY: 1000,

        // The amount of blocks along the width of the map
        mapSizeBx: 200,
        // The amount of blocks along the height of the map
        mapSizeBy: 200,
        // The total amount of blocks on the map
        mapAreaBc: 40000,

        // The width of one square of game coordinates in pixels
        gcWidthCc: 50,
        // The height of one square of game coordinates in pixels
        gcHeightCc: 50,

        // the width of the map in quadrants
        mapWidthQuadrants: 500,
        // the height of the map in quadrants
        mapHeightQuadrants: 500,
        // the width of a quadrant in cc ( pixels ) - calculate when dividing the map width in cc ( pixels ) to the map width in quadrants
        quadrantWidthCc: 200,
        // the height of a quadrant in cc ( pixels ) - calculate when dividing the map height in cc ( pixels ) to the map height in quadrants
        quadrantHeightCc: 200,
        // the thickness of the drawn horizontal quadrant boxes
        quadrantDrawnHorizontalThicknessPx: 18,
        // the length of a single dash in the quadrant dashed line
        quadrantDashedLineDashLength: 10,
        // the thickness of the drawn vertical quadrant boxes
        quadrantDrawnVerticalThicknessPx: 26,
        // the color of the drawn quadrant box
        quadrantBoxColor: '#00000055',
        // the width of a quadrant in game coordinates
        quadrantWidthGc: 4,
        // the height of a quadrant in game coordinates
        quadrantHeightGc: 4,

        // default with of the canvas in canvas coordinates ( pixels )
        canvasWidthCcDefault: 967,
        // default height of the canvas in canvas coordinates ( pixels )
        canvasHeightCcDefault: 501,

        // the width of a background coordinate ( as well as the background image itself ) in canvas coordiante ( pixels )
        backgroundWidthCc: 1250,
        // the height of a background coordinate ( as well as the background image itself ) in canvas coordiante ( pixels )
        backgroundHeightCc: 1250,

        layers: {
            terrains: 'terrains',
            resources: 'resources',
            holdings: 'holdings',
            wonders: 'wonders'

        },

        layersInABlock: [ 'terrains', 'resources', 'holdings', 'wonders' ],
        tooltipOffsetFromMouse: 10,

        moveDirection: {
            north: 'N',
            northEast: 'NE',
            east: 'E',
            southEast: 'SE',
            south: 'S',
            southWest: 'SW',
            west: 'W',
            northWest: 'NW'
        },
        drawOutsideEdgeDistanceCc: 150,
        races: {
            imperian: 1,
            nomad: 2
        },

        minimapFilterType: {
            radio: 1,
            alliance: 2,
            user: 3
        },

        filterType: {
            allianceCastles: 8
        },
        /**
         * The frame rate of the animations stage ticker update
         * Increase this number for smoother animations
         * Decrease it for better performance and rougher animations
        */
        animationsFrameRate: 10,

        clientAction: {
            showOnMap: 29,
            createBase: 'create_base'
        },
        showTooltipDelay: 300
    };

    // local private properties
    var mapProps = {
        strings: {},

        isMapInit: false,
        isMapOpen: false,
        areConfigsLoaded: false,
        isTooltipLocked: false,
        hasTickEventBeenInit: false,

        homeX: mapConstants.minX - 1, // define it outside of the map bounds so that we know when it is not properly set
        homeY: mapConstants.minY - 1, // define it outside of the map bounds so that we know when it is not properly set

        centerX: mapConstants.minX - 1, // define it outside of the map bounds so that we know when it is not properly set
        centerY: mapConstants.minY - 1, // define it outside of the map bounds so that we know when it is not properly set

        canvasWidthCc: 0,
        canvasHeightCc: 0,
        canvasWidthGc: 0,
        canvasHeightGc: 0,
        canvasCenterCx: 0,
        canvasCenterCy: 0,
        // Cx of the center of the viewport in the global coordinate system
        canvasCenterGlobalCx: 0,
        // Cx of the center of the viewport in the global coordinate system
        canvasCenterGlobalCy: 0,
        // Cx of the top left corner of the viewport in the global coordinate system
        canvasPositionGlobalCx: 0,
        // Cy of the top left corner of the viewport in the global coordinate system
        canvasPositionGlobalCy: 0,
        canvas: null,
        animationCanvas: null,
        stage: null,
        animationsStage: null,
        layers: {
            // Contains the background of the map
            background: null,
            /**
             * Contains all of the map objects
             * It is an aggregation of terrains + special resources + holdings + wonders
             */
            objects: null,
            missions: null,
            quadrants: null
        },
        preloader: null,
        blocksCache: {},
        objectsCache: {},
        visibleBlocks: [],
        pointer: {
            isDown: false,
            startPosition: { cx: 0, cy: 0 },
            currentPosition:  { cx: 0, cy: 0 },
            previousPosition: { cx: 0, cy: 0 },
            stage: {cx: 0, cy: 0}
        },
        tooltipWrapper: null,
        timers: [],
        areCardsOn: true,

        minCenterX: 0,
        minCenterY: 0,
        maxCenterX: 0,
        maxCenterY: 0,
        maxCanvasPositionGlobalCx: 0,
        maxCanvasPositionGlobalCy: 0,
        showTooltipTimeout: 0
    };

    /**
     * Stores the preloaded assets as well as all the map configs
     * @type {{assets: {}, objectsConfig: {}, actionsConfig: {}, globalConfig: {}, minimapActionsConfig: {}}}
     */
    var mapResources = {
        // Stores the preloaded assets
        assets: {},
        // Stores the map objects' config
        objectsConfig: {},
        // Stores the map actions config
        actionsConfig: {},
        // Stores the map global config
        globalConfig: {},
        // Stores the map global config
        minimapActionsConfig: {}
    };

    // local private methods
    var mapMethods = {
        /**
         * Console.logs with some added bonuses
         * 1. Only does so when in dev or test mode
         * 2. Appends MapLog: in front of every log
         * 3. Before every log, logs the line number where it was logged ( otherwise will always point to this method being the initiator )
         */
        log: function () {
            if ((typeof DEV_MODE !== 'undefined' && DEV_MODE)
                || (typeof TEST_MODE !== 'undefined' && TEST_MODE)
            ) {
                var stack = (new Error()).stack;
                console.log('MapLog:  %c' + this.extractLineNumberFromStack(stack), 'font-weight: 600;'); //ignore precommit
                // Array.prototype.push.call(arguments, this.extractLineNumberFromStack(stack));
                Array.prototype.unshift.call(arguments, 'MapLog: ');
                console.log.apply(console, arguments); //ignore precommit
            }
        },

        /**
         * Extracts the filename and line number of the position in the stack that is next to last
         * @param stack
         * @returns {string}
         */
        extractLineNumberFromStack: function (stack) {
            var extractLineNumberSplitByVariants = [' (', 'at ', '<@'];
            var line = '?';
            if (stack) {
                line = stack.split('\n')[2];
                var i = 0;
                var splitBy = extractLineNumberSplitByVariants[i];
                while (splitBy && line.indexOf(splitBy) < 0) {
                    i++;
                    splitBy = extractLineNumberSplitByVariants[i];
                }
                line = line.split(splitBy)[1];
                if (line) {
                    line = line.substring(0, line.length - 1);
                }
            }

            return line;
        },

        /**
         * Creates the containers for the map layers
         * Creates the map stage
         * Adds global stage events
         */
        initMapLayers: function () {
            mapProps.stage = new createjs.Stage(mapProps.canvas);
            /**
             * For performance purposes we can use another canvas and stage for the animations
             * but then the mouse events on it will not work therefor the missions tooltip will not show
             * @type createjs.Stage
             */
            mapProps.animationsStage = mapProps.animationsStage || new createjs.Stage(mapProps.animationCanvas);
            mapProps.stage.enableMouseOver(20);

            mapProps.layers.background = new createjs.Container();
            mapProps.layers.objects = new createjs.Container();
            mapProps.layers.missions = new createjs.Container();
            mapProps.layers.quadrants = new createjs.Container();

            mapProps.stage.addChild(mapProps.layers.background);
            mapProps.stage.addChild(mapProps.layers.objects);
            mapProps.animationsStage.addChild(mapProps.layers.missions);
            mapProps.stage.addChild(mapProps.layers.quadrants);

            mapProps.stage.addEventListener('stagemousedown', function (event) {
                mapProps.pointer.isDown = true;
                mapProps.pointer.startPosition = mapProps.pointer.previousPosition = {
                    cx: event.stageX,
                    cy: event.stageY
                };
            });
            
            mapProps.stage.addEventListener('stagemousemove', function (event) {
                mapProps.pointer.stage = {
                    cx: event.stageX,
                    cy: event.stageY
                };
                mapMethods.moveTooltip(event.stageX, event.stageY);

                if (mapProps.pointer.isDown) {
                    mapProps.pointer.currentPosition = {
                        cx: event.stageX,
                        cy: event.stageY
                    };

                    var delta = mapMethods.getConfinedDistance({
                        globalCx: mapProps.pointer.previousPosition.cx - mapProps.pointer.currentPosition.cx,
                        globalCy: mapProps.pointer.previousPosition.cy - mapProps.pointer.currentPosition.cy
                    });

                    mapProps.canvasPositionGlobalCx += delta.globalCx;
                    mapProps.canvasPositionGlobalCy += delta.globalCy;

                    mapProps.canvasCenterGlobalCx = mapProps.canvasPositionGlobalCx + mapProps.canvasWidthCc / 2;
                    mapProps.canvasCenterGlobalCy = mapProps.canvasPositionGlobalCy + mapProps.canvasHeightCc / 2;

                    mapProps.layers.objects.set({
                        x: mapProps.layers.objects.x - delta.globalCx,
                        y: mapProps.layers.objects.y - delta.globalCy
                    });

                    mapProps.layers.missions.set({
                        x: mapProps.layers.missions.x - delta.globalCx,
                        y: mapProps.layers.missions.y - delta.globalCy
                    });

                    mapProps.pointer.previousPosition = mapProps.pointer.currentPosition;

                    mapMethods.draw();
                }
            });

            mapProps.stage.addEventListener('stagemouseup', function (event) {
                mapProps.pointer.isDown = false;
                mapMethods.loadBlocksAroundGlobalCx(mapProps.canvasPositionGlobalCx, mapProps.canvasPositionGlobalCy);
            });
        },

        /**
         * Initializes the map properties, canvas, sizes and starting positions
         * @param selector - the selector of the map canvas
         * @param x - starting position x in game coordinates
         * @param y - starting position y in game coordinates
         */
        initMapProps: function (selector, x, y) {
            mapProps.canvas = document.querySelector(selector);
            if (!mapProps.canvas) {
                throw new MapException('Element ' + selector + ' not found');
            }
            mapProps.animationCanvas = document.querySelector(selector + '-animation');

            mapProps.homeX = x;
            mapProps.homeY = y;
            mapProps.canvasWidthCc = mapProps.canvas.width || mapConstants.canvasWidthCcDefault;
            mapProps.canvasHeightCc = mapProps.canvas.height || mapConstants.canvasHeightCcDefault;
            mapProps.canvasWidthGc = mapProps.canvasWidthCc / mapConstants.gcWidthCc;
            mapProps.canvasHeightGc = mapProps.canvasHeightCc / mapConstants.gcHeightCc;
            mapProps.canvasCenterCx = mapProps.canvasWidthCc / 2;
            mapProps.canvasCenterCy = mapProps.canvasHeightCc / 2;

            var minCenterGc = this.globalCc2gc(mapProps.canvasCenterCx, mapProps.canvasCenterCy);
            var maxCenterGc = this.globalCc2gc(
                mapConstants.mapWidthGc * mapConstants.gcWidthCc - mapProps.canvasCenterCx,
                mapConstants.mapHeightGc * mapConstants.gcHeightCc - mapProps.canvasCenterCy
            );
            mapProps.minCenterX = minCenterGc.x;
            mapProps.minCenterY = minCenterGc.y;
            mapProps.maxCenterX = maxCenterGc.x;
            mapProps.maxCenterY = maxCenterGc.y;

            mapProps.maxCanvasPositionGlobalCx = mapConstants.mapWidthGc * mapConstants.gcWidthCc - mapProps.canvasWidthCc;
            mapProps.maxCanvasPositionGlobalCy = mapConstants.mapHeightGc * mapConstants.gcHeightCc - mapProps.canvasHeightCc;

            mapMethods.positionMapCanvasToGc(x, y);

            mapProps.isRTL = document.body.classList.contains('right-to-left');
        },

        addGlobalActionsEvent: function () {
            if (mapResources.globalConfig.actions && mapResources.globalConfig.actions.length) {
                mapResources.globalConfig.actions = mapResources.globalConfig.actions.map(function (action) {
                    // filters empty strings and falsable values
                    return action;
                });
                if (mapResources.globalConfig.actions.length) {
                    mapProps.layers.background.addEventListener('click', function (event) {
                        var gameCoordinatesOfTheClick = mapMethods.cc2gc(event.stageX, event.stageY);
                        mapMethods.showActionsTooltip(
                            mapResources.globalConfig.actions,
                            null,
                            parseInt(gameCoordinatesOfTheClick.x, 10),
                            parseInt(gameCoordinatesOfTheClick.y, 10)
                        );
                    });
                }
            }
        },

        /**
         * Determines the position of the map canvas' center and upper left corner based on game coorinates
         * @param x - the x game coordinate of the center of the map
         * @param y - the y game coordinate of the center of the map
         */
        positionMapCanvasToGc: function(x, y) {
            x = Math.max(x, mapProps.minCenterX);
            y = Math.max(y, mapProps.minCenterY);
            x = Math.min(x, mapProps.maxCenterX);
            y = Math.min(y, mapProps.maxCenterY);

            mapProps.centerX = x;
            mapProps.centerY = y;
            mapProps.canvasCenterGlobalCx = mapProps.centerX * mapConstants.gcWidthCc;
            mapProps.canvasCenterGlobalCy = mapProps.centerY * mapConstants.gcHeightCc;
            mapProps.canvasPositionGlobalCx = mapProps.canvasCenterGlobalCx - mapProps.canvasWidthCc / 2;
            mapProps.canvasPositionGlobalCy = mapProps.canvasCenterGlobalCy - mapProps.canvasHeightCc / 2;
        },

        /**
         * Clears the layers with objects, missions, quadrants from the map
         * Also removes all html elements associated with them ( createjs.DomElement )
         */
        clearObjects: function () {
            mapProps.layers.objects.removeAllChildren();
            mapProps.layers.missions.removeAllChildren();
            mapProps.layers.quadrants.removeAllChildren();

            Array.prototype.forEach.call(
                mapProps.canvas.parentNode.querySelectorAll('.map-user-card, .map-timer, .wonder-close-wrapper'), function (element) {
                element.parentNode.removeChild(element);
            });
        },

        /**
         * Reposition the objects and missions layers to their original position
         */
        positionLayers: function () {
            mapProps.layers.objects.set({
                x: 0,
                y: 0
            });
            mapProps.layers.missions.set({
                x: 0,
                y: 0
            });
        },

        /**
         * Creates a new createjs.LoadQueue with base path and configuration
         */
        initPreloader: function () {
            mapProps.preloader = new createjs.LoadQueue(true, '../static/images/', 'Anonymous');
            mapProps.preloader.addEventListener('fileload', this.onPreloadFileload);
        },

        /**
         * Creates the map tooltip element and appends it to the canvas' parent
         */
        initMapTooltip: function () {
            mapProps.tooltipWrapper = document.createElement('div');
            mapProps.tooltipWrapper.id = 'map-tooltip';
            mapProps.canvas.parentNode.appendChild(mapProps.tooltipWrapper);
            mapProps.tooltipWrapper.onmouseover = function () {
                clearTimeout(mapProps.showTooltipTimeout);
            }
        },

        /**
         * Executed when a file is successfully preloaded
         * if the file type is image - saves it as preloaded in mapResources.assets
         * @param event
         */
        onPreloadFileload: function (event) {
            var item = event.item;
            var type = item.type;

            if (type === createjs.Types.IMAGE && event.result) {
                mapResources.assets[item.id] = event.result;
            }
        },

        /**
         * Simple get request to an url
         * returns a promise that is resolved with the parsed response, if such, else with an empty object
         * @param url
         * @returns {Promise}
         */
        get: function (url) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: url,
                    success: function (result) {
                        try {
                            resolve(JSON.parse(result));
                        } catch(e) {
                            try {
                                var decodedResponse = decodeMapResponse(result);
                                resolve(decodedResponse);
                            } catch(er) {
                                resolve({});
                            }
                        }
                    },
                    error: function () {
                        resolve({});
                    }
                });
            });
        },

        /**
         * Transforms a set of game coordinates into canvas coordinates relative to the canvas global position
         * @param x
         * @param y
         * @returns {{cx: number, cy: number}}
         */
        gc2cc: function (x, y) {
            var globalCc = this.gc2globalCc(x, y);
            return {
                cx: globalCc.cx - mapProps.canvasPositionGlobalCx,
                cy: globalCc.cy - mapProps.canvasPositionGlobalCy
            }
        },

        /**
         * Transforms a set of game coordinates into a canvas coordinates RELATIVE to the position of the canvas stage
         * @param x
         * @param y
         * @returns {{cx: number, cy: number}}
         */
        gc2relativeCc: function (x, y) {
            var globalCc = this.gc2globalCc(x, y);
            return {
                cx: Math.round(globalCc.cx - (mapProps.centerX * mapConstants.gcWidthCc - mapProps.canvasWidthCc / 2)),
                cy: Math.round(globalCc.cy - (mapProps.centerY * mapConstants.gcHeightCc - mapProps.canvasHeightCc / 2))
            }
        },

        /**
         * Transforms a set of game coordinates into global canvas coordinates
         * @param x
         * @param y
         * @returns {{cx: number, cy: number}}
         */
        gc2globalCc: function (x, y) {
            return {
                cx: x * mapConstants.gcWidthCc,
                cy: y * mapConstants.gcHeightCc
            };
        },

        /**
         * Transforms a set of canvas coordinates into game coordinates
         * @param cx
         * @param cy
         * @returns {{x: number, y: number}}
         */
        cc2gc: function (cx, cy) {
            return {
                x: (cx + mapProps.canvasPositionGlobalCx) / mapConstants.gcWidthCc,
                y: (cy + mapProps.canvasPositionGlobalCy) / mapConstants.gcHeightCc
            };
        },

        /**
         * Transforms a set of global canvas coordinates into coordinates in the background matrix
         * @param globalCx
         * @param globalCy
         * @returns {{bgx: number, bgy: number}}
         */
        globalCc2bgc: function (globalCx, globalCy) {
            return {
                bgx: Math.floor(globalCx / mapConstants.backgroundWidthCc),
                bgy: Math.floor(globalCy / mapConstants.backgroundHeightCc)
            };
        },

        /**
         * Transforms a set of global canvas coordinates into game coordinates
         * @param globalCx
         * @param globalCy
         * @returns {{x: number, y: number}}
         */
        globalCc2gc: function (globalCx, globalCy) {
            return {
                x: Math.floor(globalCx / mapConstants.gcWidthCc),
                y: Math.floor(globalCy / mapConstants.gcHeightCc)
            };
        },

        /**
         * Returns the canvas coordinates of a point on a line described by two other points ( start and end )
         * and a ration witch is the length of the line between the start point and the point we are looking for
         * over (divided to) the length of the line between start point and end point
         * @param startCc - start point canvas coordinates {{cx: Number, cy: Number}}
         * @param endCc - end point canvas coordinates {{cx: Number, cy: Number}}
         * @param ratio - the ration between Length(start - looking) / Length(end - start)
         * @returns {{cx: Number, cy: Number}}
         */
        getPointOnLine: function (startCc, endCc, ratio) {
            return {
                cx: Math.round(startCc.cx + (endCc.cx - startCc.cx) * ratio),
                cy: Math.round(startCc.cy + (endCc.cy - startCc.cy) * ratio)
            };
        },

        /**
         * Returns a number that uniquely represent a background cell in the background matrix
         * The background matrix is the game field divided into cells with the with and height of the background
         * @param bgx
         * @param bgy
         * @returns {number}
         */
        getBackgroundIdByBgc: function (bgx, bgy) {
            return bgx + bgy * mapConstants.mapWidthGc * mapConstants.gcWidthCc / mapConstants.backgroundWidthCc;
        },

        /**
         * Returns a single block id that contains the given game coordinates
         * @param x
         * @param y
         * @returns {number}
         */
        getBlockIdByGc: function (x, y) {
            var bx = Math.floor(x / mapConstants.blockWidthGc);
            var by = Math.floor(y / mapConstants.blockHeightGc);

            return by * mapConstants.mapSizeBy + bx;
        },

        /**
         * Returns a single block id that contains the given canvas coordinates
         * @param cx
         * @param cy
         * @returns {number}
         */
        getBlockIdByCc: function (cx, cy) {
            var gc = this.cc2gc(cx, cy);

            return this.getBlockIdByGc(gc.x, gc.y);
        },

        /**
         * Returns an array of objects of type {bcx, bcy} which are the background coordinates
         * of the backgrounds that need to be drawn for the 4 global coordinates
         * that describe a rectangle in the global coordinate system
         * so that the space between these global coordinates is filled
         *
         * @param globalCx1 - the first global x coordinate of the rectangle
         * @param globalCx2 - the second global x coordinate of the rectangle
         * @param globalCy1 - the first global y coordinate of the rectangle
         * @param globalCy2 - the second global y coordinate of the rectangle
         */
        getBackgroundPositionsByGlobalPoints: function (globalCx1, globalCx2, globalCy1, globalCy2) {
            // swap the coordinates if they have been passed ion the wrong order
            var swap;
            if (globalCx1 > globalCx2) {
                swap = globalCx1, globalCx1 = globalCx2, globalCx2 = swap;
            }
            if (globalCy1 > globalCy2) {
                swap = globalCy1, globalCy1 = globalCy2, globalCy2 = swap;
            }

            var startingPointBgc = this.globalCc2bgc(globalCx1, globalCy1);
            var widthInBackgrounds = this.globalCc2bgc(globalCx2, globalCy1).bgx - startingPointBgc.bgx + 1;
            var heightInBackgrounds = this.globalCc2bgc(globalCx1, globalCy2).bgy - startingPointBgc.bgy + 1;

            var backgroundPositions = [];

            for (var bgx = 0; bgx < widthInBackgrounds; bgx++) {
                for (var bgy = 0; bgy < heightInBackgrounds; bgy++) {
                    backgroundPositions.push({
                        bgx: startingPointBgc.bgx + bgx,
                        bgy: startingPointBgc.bgy + bgy
                    });
                }
            }

            return backgroundPositions;
        },

        /**
         *
         * @param x - the x game coordinate of a map object
         * @param y - the y game coordinate of a map object
         * @param factor - describes 'how many blocks outside of the visible screen we want to load',
         * example:
         * 0 - only so many blocks that fill the visible part of the screen
         * 1 - blocks that can fill border thick 1 `screen` around the visible screen
         *     these: * * *
         *            * X *
         *            * * *
         *     where the X is the visible part of the screen
         */
        getMultipleBlocksAroundGc: function (x, y, factor) {
            var s = new Date().getTime();
            factor = typeof factor !== 'undefined' ? factor : mapConstants.blockLoadingFactorDefault;

            var offsetCx = mapProps.canvasWidthCc * factor;
            var offsetCy = mapProps.canvasHeightCc * factor;
            var centerCc = this.gc2cc(x, y);

            var minCx = centerCc.cx - offsetCx;
            var maxCx = centerCc.cx + offsetCx;
            var minCy = centerCc.cy - offsetCy;
            var maxCy = centerCc.cy + offsetCy;
            var blockIds = [];

            for (var cx = minCx; cx <= maxCx; cx += mapConstants.gcWidthCc) {
                for (var cy = minCy; cy <= maxCy; cy += mapConstants.gcHeightCc) {
                    var blockId = this.getBlockIdByCc(cx, cy);
                    if (
                        blockId >= 0
                        && blockId < mapConstants.mapAreaBc
                        && blockIds.indexOf(blockId) === -1
                    ) {
                        blockIds.push(blockId)
                    }
                }
            }
            return blockIds;
        },

        /**
         * Removes the objects on the same coordinate, leaving the topmost one
         * Sorts the block so that object may overlap properly
         * @param block - Array of block objects
         * @returns Array of block objects
         */
        reduceBlock: function (block) {
            var objectsInBlock = {};
            block.forEach(function (object) {
                var x = parseInt(object.x, 10);
                var y = parseInt(object.y, 10);
                objectsInBlock[x + ',' + y] = object;
            });
            return Object.keys(objectsInBlock)
                .map(function (key) {
                    return objectsInBlock[key];
                })
                .sort(function (o1, o2) {
                return o1.y - o2.y + o1.x - o2.x;
            });
        },

        /**
         * Requests the map config from the server and returns a promise
         * that is resolved when ALL of the configs are returned and saved in mapResources
         * IF the configs have already been loaded - resolves the promise immediately instead
         * @returns {Promise}
         */
        loadConfigs: function (objectsConfig) {
            if (mapProps.areConfigsLoaded) {
                return Promise.resolve();
            }

            if (objectsConfig) {
                mapConstants.configUrls.objectsConfig = 'json/' + objectsConfig;
            }

            var configLoadedPromises = [];
            for (var config in mapConstants.configUrls) {
                if (mapConstants.configUrls.hasOwnProperty(config)) {
                    (function (config) {
                        var configLoadedPromise = mapMethods.get(mapConstants.configUrls[config]).then(function (value) {
                            mapResources[config] = value;
                        });
                        configLoadedPromises.push(configLoadedPromise);
                    }(config));
                }
            }

            return Promise.all(configLoadedPromises);
        },

        /**
         * Preloads an array of assets that have id and src
         * Returns a promise and resolves it when the preloader completes
         * Ignores all errors and still resolves the promise on complete
         * @param assets - [ { id, src } ]
         * @returns {Promise}
         */
        preloadAssets: function (assets) {
            !mapProps.preloader && this.initPreloader();

            var assetsToPreload = assets.filter(function (asset) {
                return !mapResources.assets[asset.id];
            });

            return new Promise(function (resolve, reject) {
                if (assetsToPreload.length) {
                    mapProps.preloader.addEventListener('complete', resolve);
                    mapProps.preloader.addEventListener('error', function (event) {
                        mapMethods.log('Preloader error', event);
                    });
                    mapProps.preloader.loadManifest(assetsToPreload);
                } else {
                    resolve();
                }
            });
        },

        /**
         * Returns an array of objects {src, id} that is the visible assets manifests to preload for the current visible blocks
         * @returns {Array}
         */
        getVisibleAssets: function () {
            var assetsToPreload = [];
            var assetsToPreloadObj = {};
            mapProps.visibleBlocks.forEach(function (blockId) {
                if (!mapProps.blocksCache.hasOwnProperty(blockId)) {
                    throw new MapException('Visible block with id ' + blockId + ' is not loaded!');
                }

                var block = mapProps.blocksCache[blockId];
                block.forEach(function (object) {
                    object.obs.forEach(function (obj) {
                        // push colony images for preload if any, they are a different case than any other map object
                        if (parseInt(obj.mobile_type, 10) === mapConstants.holdingType.colony) {
                            var colonyType = mapMethods.getColonyTypeByRace(obj.race_id);
                            assetsToPreloadObj[mapMethods.getObjectAssetIdByType(colonyType)] = mapResources.objectsConfig.objects[colonyType].image;
                        }
                        // if the object has type ( for example colonies without special resource doesn't have one )
                        if (obj.type) {
                            assetsToPreloadObj[mapMethods.getObjectAssetIdByType(obj.type)] = mapResources.objectsConfig.objects[obj.type].image;
                            if (obj.wonder) {
                                assetsToPreloadObj[obj.wonder.img] = obj.wonder.img;
                            }
                        }
                    });
                });
            });

            Object.keys(assetsToPreloadObj).forEach(function (key) {
                assetsToPreload.push({
                    id: key,
                    src: assetsToPreloadObj[key]
                });
            });

            return assetsToPreload;
        },

        /**
         * Returns a custom asset id based on the asset type
         * this is is used to save the preloaded asset and reference it later
         * @param type
         * @returns {string}
         */
        getObjectAssetIdByType: function (type) {
            return 'mo' + type;
        },

        // Draw methods:
        draw: function() {
            mapProps.isTooltipLocked = false;
            mapProps.tooltipWrapper.innerHTML = '';

            mapProps.stage.clear();
            this.drawBackground();
            this.drawObjects();
            this.drawQuadrants();
            mapProps.stage.update();
            mapProps.animationsStage.update();
        },

        /**
         * Draws the quadrant side boxes, as well as the dashed lines on the map itself
         * Rewards the dashed lines based on the mapProps.canvasPositionGlobalCx/Cy so that
         * when the map moves, the lines look like they are drawn to the background, rather than stay fixed on top of it
         */
        drawQuadrants: function () {
            mapProps.layers.quadrants.removeAllChildren();

            var qx0floor = mapProps.canvasPositionGlobalCx / mapConstants.quadrantWidthCc;
            var qy0floor = mapProps.canvasPositionGlobalCy / mapConstants.quadrantHeightCc;
            var qx0 = Math.ceil(qx0floor);
            var qy0 = Math.ceil(qy0floor);
            var qx1 = Math.ceil((mapProps.canvasPositionGlobalCx + mapProps.canvasWidthCc) / mapConstants.quadrantWidthCc);
            var qy1 = Math.ceil((mapProps.canvasPositionGlobalCy + mapProps.canvasHeightCc) / mapConstants.quadrantHeightCc);

            // the start x position of the vertical quadrants drawn
            var quadrantStartCx = (Math.floor(qx0floor) - qx0floor) * mapConstants.quadrantWidthCc;
            // the start y position of the horizontal quadrants drawn
            var quadrantStartCy = (Math.floor(qy0floor) - qy0floor) * mapConstants.quadrantHeightCc;

            var g;
            var quadrantRect;
            var quadrantText;
            var quadrantWrapper;

            // draw the horizontal quadrants
            for (var quadrantX = qx0; quadrantX <= qx1; quadrantX++) {
                g = new createjs.Graphics();
                g.beginFill(mapConstants.quadrantBoxColor)
                    .drawRect(0, 0, mapConstants.quadrantWidthCc - 1, mapConstants.quadrantDrawnHorizontalThicknessPx)
                    .beginStroke(mapConstants.quadrantBoxColor)
                    .dashedLineTo(
                        mapConstants.quadrantWidthCc,
                        -(mapProps.canvasPositionGlobalCy % (mapConstants.quadrantDashedLineDashLength * 2)),
                        mapConstants.quadrantWidthCc,
                        -mapProps.canvasHeightCc,
                        mapConstants.quadrantDashedLineDashLength
                    );

                quadrantRect = new createjs.Shape(g);
                quadrantText = new createjs.Text(quadrantX, '8px Arial', '#FFFFFF');
                quadrantText.set({
                    textAlign: 'left',
                    textBaseline: 'middle',
                    x: 5, // just some small offset from the left edge
                    y: mapConstants.quadrantDrawnHorizontalThicknessPx / 2
                });

                quadrantWrapper = new createjs.Container();
                quadrantWrapper.addChild(quadrantRect);
                quadrantWrapper.addChild(quadrantText);
                mapProps.layers.quadrants.addChild(quadrantWrapper);
                quadrantWrapper.set({
                    x: quadrantStartCx + (quadrantX - qx0) * mapConstants.quadrantWidthCc,
                    y: mapProps.canvasHeightCc - mapConstants.quadrantDrawnHorizontalThicknessPx,
                    name: 'quadrantHorizontal' + quadrantX
                });

            }

            // draw the vertical quadrants
            for (var quadrantY = qy0; quadrantY <= qy1; quadrantY++) {
                g = new createjs.Graphics();
                g.beginFill(mapConstants.quadrantBoxColor)
                    .drawRect(0, 0, mapConstants.quadrantDrawnVerticalThicknessPx, mapConstants.quadrantHeightCc - 1)
                    .beginStroke(mapConstants.quadrantBoxColor)
                    .dashedLineTo(
                        -(mapProps.canvasPositionGlobalCx % (mapConstants.quadrantDashedLineDashLength * 2)),
                        mapConstants.quadrantHeightCc,
                        -mapProps.canvasWidthCc,
                        mapConstants.quadrantHeightCc,
                        mapConstants.quadrantDashedLineDashLength
                    );

                quadrantRect = new createjs.Shape(g);
                quadrantText = new createjs.Text(quadrantY, '8px Arial', '#FFFFFF');
                quadrantText.set({
                    textAlign: 'left',
                    textBaseline: 'top',
                    x: 5, // just some small offset from the left edge
                    y: 5 // just some small offset from the top edge
                });
                quadrantWrapper = new createjs.Container();
                quadrantWrapper.addChild(quadrantRect);
                quadrantWrapper.addChild(quadrantText);
                mapProps.layers.quadrants.addChild(quadrantWrapper);

                quadrantWrapper.set({
                    x: mapProps.canvasWidthCc - mapConstants.quadrantDrawnVerticalThicknessPx,
                    y: quadrantStartCy + (quadrantY - qy0) * mapConstants.quadrantHeightCc,
                    name: 'quadrantVertical' + quadrantY
                });
            }
        },

        /**
         * Calculates how many backgrounds to draw, where to draw them, and finally draws them
         */
        drawBackground: function () {
            mapProps.layers.background.removeAllChildren();
            /**
             * There are the global cx and cy coordinates of the visible screen's corners
             * with some offset outside the visible zone ( drawOutsideEdgeDistanceCc )
              * @type {number}
             */
            var globalCx1 = mapProps.canvasPositionGlobalCx - mapConstants.drawOutsideEdgeDistanceCc;
            var globalCx2 = mapProps.canvasPositionGlobalCx + mapProps.canvasWidthCc + mapConstants.drawOutsideEdgeDistanceCc;
            var globalCy1 = mapProps.canvasPositionGlobalCy - mapConstants.drawOutsideEdgeDistanceCc;
            var globalCy2 = mapProps.canvasPositionGlobalCy + mapProps.canvasHeightCc + mapConstants.drawOutsideEdgeDistanceCc;

            var possibleBackgroundPositions = this.getBackgroundPositionsByGlobalPoints(
                globalCx1,
                globalCx2,
                globalCy1,
                globalCy2
            );

            var backgroundsToDraw = [];
            var backgroundsToDrawIds = [];
            possibleBackgroundPositions.forEach(function (bg) {
               var bgId = mapMethods.getBackgroundIdByBgc(bg.bgx, bg.bgy);
                if (backgroundsToDrawIds.indexOf(bgId) === -1) {
                    backgroundsToDraw.push(bg);
                    backgroundsToDrawIds.push(bgId);
                }
            });

            backgroundsToDraw.forEach(function (bg) {
                var bgCx = bg.bgx * mapConstants.backgroundWidthCc - globalCx1;
                var bgCy = bg.bgy * mapConstants.backgroundHeightCc - globalCy1;
                var backgroundBmp = mapFactory.background(bgCx, bgCy);
                mapProps.layers.background.addChild(backgroundBmp);
            });
        },

        /**
         * Draws a single map object with all of its additional elements
         * @param x - the x game coordinate of the object
         * @param y - the y game coordinate of the object
         * @param objectPart - the object data as received from the server
         * @param blockContainer - the block container to draw the object in
         * @param blockId - the id of the block the object belongs in
         */
        drawSingleObject: function (x, y, objectPart, blockContainer, blockId) {
            var type = objectPart.type;

            /**
             * This handles the case where the object is a colony
             * This is a special case because when the map object is a colony
             * and there is no special resource under it - it is returned as a map object with no type
             * whereas when there is a special resource under it - it is returned as a map object
             * WITH the type of the special resource and we have to draw the colony image outselves
             *
             */
            if (!type) {
                if (parseInt(objectPart.mobile_type, 10) === mapConstants.holdingType.colony) {
                    type = mapMethods.getColonyTypeByRace(objectPart.race_id);
                } else {
                    return;
                }
            }

            var config = mapResources.objectsConfig.objects[type];
            var layer = mapMethods.getLayerByLevel(config.level);
            var assetId = mapMethods.getObjectAssetIdByType(type);

            var layerContainer = objectPart.move
                ? mapProps.layers.missions
                : blockContainer.getChildByName(mapFactory.getBlockSubContainerName(blockId, layer));
            var bmpContainer = layerContainer.getChildByName(objectPart.id);
            var bounds = {
                width: 0,
                height: 0
            };

            if (!bmpContainer) {
                bmpContainer = new createjs.Container();
                bmpContainer.set({
                    name: objectPart.id
                });

                if (objectPart.move) {
                    var startCc = mapMethods.gc2relativeCc(objectPart.move.start2.x, objectPart.move.start2.y);
                    var endCc = mapMethods.gc2relativeCc(objectPart.move.end.x, objectPart.move.end.y);
                    var g = new createjs.Graphics();
                    g.setStrokeStyle(2);
                    g.beginStroke('#' + (objectPart.move.linecolor + '').substr(2));
                    g.beginFill('#' + (objectPart.move.linecolor + '').substr(2));
                    g.moveTo(startCc.cx, startCc.cy).lineTo(endCc.cx, endCc.cy);

                    layerContainer.addChild(new createjs.Shape(g));
                }

                layerContainer.addChild(bmpContainer);

                // The map object itself
                var image = new createjs.Bitmap(mapResources.assets[assetId]);
                image.set({ name: 'image' });
                bounds = image.getBounds() || bounds;

                // if there is a wonder
                if (objectPart.wonder && objectPart.wonder.img) {
                    var wonderImage = new createjs.Bitmap(mapResources.assets[objectPart.wonder.img]);
                    wonderImage.set({
                        regX: 0,
                        regY: wonderImage.getBounds().height,
                        x: -50,
                        y: 120
                    });
                    bmpContainer.addChild(wonderImage);
                    // var wonderClose = new createjs.Bitmap(mapResources.assets['map-card-close']);
                    // wonderClose.set({
                    //     x: 0,
                    //     y: 0,
                    //     cursor: 'pointer'
                    // });
                    var wonderCloseWrapperElement = document.createElement('div');
                    wonderCloseWrapperElement.classList.add('wonder-close-wrapper');
                    wonderCloseWrapperElement.classList.add('map-dom-element-' + blockId);
                    var wonderCloseElement = document.createElement('div');
                    wonderCloseElement.classList.add('wonder-close');
                    wonderCloseWrapperElement.appendChild(wonderCloseElement);
                    mapProps.canvas.parentNode.appendChild(wonderCloseWrapperElement);

                    var wonderClose = new createjs.DOMElement(wonderCloseWrapperElement);
                    wonderClose.set({
                        x: 150,
                        y: 10
                    });
                    wonderCloseElement.addEventListener('click', function () {
                        bmpContainer.removeChild(wonderImage);
                        bmpContainer.removeChild(wonderClose);
                        mapProps.canvas.parentNode.removeChild(wonderCloseWrapperElement);
                        mapProps.stage.update();
                    });
                    bmpContainer.addChild(wonderClose);

                    if (objectPart.wonder.tooltip && objectPart.wonder.tooltip.length) {
                        var wonderTooltip = mapFactory.createTooltip(objectPart.wonder.tooltip);
                        wonderImage.addEventListener('rollover', function () {
                            // show wonderTooltip
                            // clearTimeout(mapProps.showTooltipTimeout);
                            // mapProps.showTooltipTimeout = setTimeout(function () {
                                mapProps.tooltipWrapper.innerHTML = wonderTooltip;
                                mapMethods.moveTooltip(mapProps.pointer.stage.cx, mapProps.pointer.stage.cy);
                            // }, mapConstants.showTooltipDelay);
                        });

                        wonderImage.addEventListener('rollout', function () {
                            // hide tooltip
                            if (!mapProps.isTooltipLocked) {
                                mapProps.tooltipWrapper.innerHTML = '';
                            }
                        });
                    }
                }

                /**
                 * This handles the case where the object is a colony
                 * This is a special case because when the map object is a colony
                 * and there is no special resource under it - it is returned as a map object with no type
                 * whereas when there is a special resource under it - it is returned as a map object
                 * WITH the type of the special resource and we have to draw the colony image outselves
                 *
                 */
                if (objectPart.colony) {

                    /**
                     * This is the colony color polygon
                     * since the colony is special kind of map object, its images are without the color polygon under it
                     * so we need to draw it manually
                     *
                     * This will default to black color if the colony_color is not a correct color
                     */
                    if (objectPart.colony_color) {
                        var polygon = mapFactory.createColonyPolygon(objectPart.colony_color);

                        bmpContainer.addChild(polygon);
                    }

                    /**
                     * Add the object image here
                     * this is either the colony when it's not on a resource
                     * OR the resource itself, when the colony is on one
                     */
                    bmpContainer.addChild(image);

                    if (mapMethods.isColonyOverResource(type)) {
                        /**
                         * After the image of the resource is drawn we replace the image variable with the colony bitmap
                         * so that the events are tiggered when you click/rollover on it.
                         */
                        image = new createjs.Bitmap(mapResources.assets[mapMethods.getObjectAssetIdByType(mapMethods.getColonyTypeByRace(objectPart.race_id))]);;
                        bmpContainer.addChild(image);
                    }

                    // colony timer
                    if (objectPart.c_time) {
                        var timer = mapFactory.createMapTimer(objectPart.c_time, blockId);
                        bmpContainer.addChild(timer);
                        timer.set({
                            x: (bounds.width - timer.htmlElement.clientWidth) / 2,
                            y: -10
                        });
                    }

                    /**
                     * Colonies in the flash version are differently offset than the other objects
                     * hence the need to modify the bounds used for calculation
                     * @type {{width: number, height: number}}
                     */
                    bounds = image.getBounds() || bounds;
                    bounds = {
                        width: bounds.width * 2,
                        height: bounds.height * 2
                    };
                } else {
                    // add the object image after the wonder when the object is not a colony
                    bmpContainer.addChild(image);
                }

                // The map object status icon of any
                if (objectPart.box) {
                    var status = new createjs.Bitmap(mapResources.assets[mapConstants.mapStatusIconPrefix + objectPart.box]);
                    bmpContainer.addChild(status);
                }

                // If its a capital - add the user card
                if (parseInt(objectPart.mobile_type, 10) === mapConstants.holdingType.userCapital) {
                    var card = mapFactory.createMapCard(objectPart, blockId, objectPart.id);
                    card.set({
                        x: (bounds.width - card.htmlElement.clientWidth) / 2,
                        y: -card.htmlElement.clientHeight
                    });
                    bmpContainer.addChild(card);
                }

                // add tooltip events
                if (objectPart.ttp && objectPart.ttp.length) {
                    var tooltip = mapFactory.createTooltip(objectPart.ttp);
                    image.addEventListener('rollover', function () {
                        // show tooltip
                        // clearTimeout(mapProps.showTooltipTimeout);
                        // mapProps.showTooltipTimeout = setTimeout(function () {
                            mapProps.isTooltipLocked = false;
                            mapProps.tooltipWrapper.innerHTML = tooltip;
                            mapMethods.moveTooltip(mapProps.pointer.stage.cx, mapProps.pointer.stage.cy);
                        // }, mapConstants.showTooltipDelay);
                    });

                    image.addEventListener('rollout', function () {
                        // hide tooltip
                        if (!mapProps.isTooltipLocked) {
                            mapProps.tooltipWrapper.innerHTML = '';
                        }
                    });
                }

                var cc = mapMethods.gc2relativeCc(x, y);
                bmpContainer.set({
                    x: Math.round(cc.cx - bounds.width / 2),
                    y: Math.round(cc.cy - bounds.height / 2)
                });

                /**
                 * Add mission object move animation
                 * call mapMethods.updateBlock after the animation is over ( the mission is presumably complete )
                 */
                if (objectPart.move) {
                    var endCcTween = mapMethods.gc2relativeCc(objectPart.move.end.x, objectPart.move.end.y);
                    var startCcTween = mapMethods.gc2relativeCc(objectPart.move.start2.x, objectPart.move.start2.y);
                    // calculate the correct position of the bmp on the line between the the points of the move animations
                    // based on the remaining and the total duration of the move
                    var bmpCc = mapMethods.getPointOnLine(startCcTween, endCcTween, 1 - (objectPart.move.duration / objectPart.move.m_s));
                    bmpContainer.set({
                        x: bmpCc.cx - bounds.width / 2,
                        y: bmpCc.cy - bounds.height / 2
                    });
                    createjs.Tween.get(bmpContainer).to({x: endCcTween.cx, y: endCcTween.cy}, objectPart.move.duration * 1000).call(function() {
                        mapMethods.updateBlock(blockId);
                    });

                    if (!mapProps.hasTickEventBeenInit) {
                        mapProps.hasTickEventBeenInit = true;

                        createjs.Ticker.framerate = mapConstants.animationsFrameRate;
                        createjs.Ticker.addEventListener('tick', function () {
                            mapProps.animationsStage.update();
                        });
                    }
                }

                if (objectPart.acs && objectPart.acs.length) {
                    bmpContainer.addEventListener('click', function () {
                        mapMethods.showActionsTooltip(objectPart.acs, objectPart.id);
                    });
                }

            } else if (!objectPart.move) {
                var cc = mapMethods.gc2relativeCc(x, y);
                bmpContainer.set({
                    x: Math.round(cc.cx - bounds.width / 2),
                    y: Math.round(cc.cy - bounds.height / 2)
                });
            }
        },
        /**
         * Draws all of the objects in all of the visible blocks if they hare not already been drawn
         */
        drawVisibleBlocks: function () {
            mapProps.visibleBlocks.forEach(function (blockId) {
                var blockContainer = mapFactory.blockContainer(blockId);
                var areObjectsDrawn = mapMethods.areObjectsDrawn(blockContainer);
                if (!areObjectsDrawn) {
                    var block = mapMethods.reduceBlock(mapProps.blocksCache[blockId]);
                    block.forEach(function (object) {
                        var x = parseInt(object.x, 10);
                        var y = parseInt(object.y, 10);

                        object.obs.forEach(function (objectPart) {
                            mapMethods.drawSingleObject(x, y, objectPart, blockContainer, blockId);
                        });
                    });
                }
            });

            // Sort the drawn blocks so that the blocks that are more to the bottom right are more to the top of the display
            mapProps.layers.objects.sortChildren(function (blockA, blockB) {
                return mapFactory.getBlockIdFromContainerName(blockA.name) - mapFactory.getBlockIdFromContainerName(blockB.name);
            });
        },

        /**
         * Removes all blocks from the stage's layer 'objects' that are no longer visible
         */
        removeNotVisibleBlocks: function () {
            var childrenToRemove = [];
            mapProps.layers.objects.children.forEach(function (child) {
                var blockId = mapFactory.getBlockIdFromContainerName(child.name);
                if (mapProps.visibleBlocks.indexOf(blockId) === -1) {
                    childrenToRemove.push(child);

                    mapMethods.removeDomElementsForBlock(blockId);
                }
            });

            childrenToRemove.forEach(function (value) {
                mapProps.layers.objects.removeChild(value);
            });
        },

        /**
         * Removes all of the dom elements that are associated with this block ( user cards, timers, etc )
         * @param blockId
         */
        removeDomElementsForBlock: function (blockId) {
            Array.prototype.forEach.call(mapProps.canvas.parentNode.querySelectorAll('.map-dom-element-' + blockId), function (element) {
                element.parentNode.removeChild(element);
            });
        },

        /**
         * Updates a single block
         * clears it from the cache, request it from server and redraws it
         * @param blockId
         */
        updateBlock: function (blockId) {
            mapProps.visibleBlocks.splice(mapProps.visibleBlocks.indexOf(blockId), 1);
            this.removeDomElementsForBlock(blockId);

            this.get(mapConstants.getBlocksUrl + 'b=' + blockId).then(function (response) {
                if (response.blocks && response.blocks.length) {
                    response.blocks.forEach(function (block) {
                        mapProps.blocksCache[block.id] = block.data;
                        mapProps.visibleBlocks.push(blockId);
                    });
                }
                mapProps.layers.objects.removeChild(mapProps.layers.objects.getChildByName(mapFactory.getBlockContainerName(blockId)));
                mapMethods.draw();
            });
        },

        /**
         * Draws all of the map objects that are in the visible blocks
         * Removes all blocks that are not visible
         */
        drawObjects: function () {
            var assetsToPreload = this.getVisibleAssets();
            mapMethods.preloadAssets(assetsToPreload).then(function () {
                mapMethods.drawVisibleBlocks();

                mapMethods.removeNotVisibleBlocks();

                mapProps.stage.update();
            });
        },

        /**
         * Returns the name of the layer based on the config.level of an object
         * @param level
         * @returns {string}
         */
        getLayerByLevel: function (level) {
            switch (parseInt(level, 10)) {
                case 1: return mapConstants.layers.terrains;
                case 2: return mapConstants.layers.holdings;
                case 3: return mapConstants.layers.resources;
                case 4: return mapConstants.layers.wonders;
            }
        },

        /**
         * Loads multiple blocks around game coordinates
         * when the blocks have been successfully loaded will set the visibleBlocks property
         * visibleBlocks are used for the drawing
         * @param x
         * @param y
         * @param flush - if omitted or false this will load only blocks that have not beed loaded yet
         *              - if true - will load all surrounding blocks anew
         * @returns {Promise}
         */
        loadBlocksAroundGc: function (x, y, flush) {
            flush = flush || false;
            return new Promise(function (resolve, reject) {
                var blockIdsToLoad = mapMethods.getMultipleBlocksAroundGc(x, y, 2);
                // clone the array because we have to modify it, and still have a full copy of it to assign to vissible block when they have been loaded
                var blockIdsToLoadInitial = blockIdsToLoad.slice();

                if (!flush) {
                    blockIdsToLoad = blockIdsToLoad.filter(function (blockId) {
                        // filter the block ids that are already in the cache
                        return !mapProps.blocksCache[blockId];
                    });
                }

                if (blockIdsToLoad.length) {
                    var queryParamsString = blockIdsToLoad.map(function (blockId) {
                        return 'b=' + blockId;
                    }).join('&');

                    mapMethods.get(mapConstants.getBlocksUrl + queryParamsString).then(function (response) {
                        if (response.blocks && response.blocks.length) {
                            response.blocks.forEach(function (block) {
                                mapProps.blocksCache[block.id] = block.data;
                            });
                            mapProps.visibleBlocks = blockIdsToLoadInitial;
                            resolve();
                        }
                    });
                } else {
                    mapProps.visibleBlocks = blockIdsToLoadInitial;
                    resolve();
                }
            });

        },

        /**
         * Loads blocks based on a global canvas coordinates
         * @param globalCx
         * @param globalCy
         * @param flush
         */
        loadBlocksAroundGlobalCx: function (globalCx, globalCy, flush) {
            var gc = this.globalCc2gc(globalCx, globalCy);
            return this.loadBlocksAroundGc(gc.x, gc.y, flush);
        },

        /**
         * Returns whether objects have been drawn for a certain container
         * @param container {createjs.Container} - the container to check
         * @returns {boolean}
         */
        areObjectsDrawn: function (container) {
            var totalObjects = 0;
            for (var i = 0; i < container.numChildren; i++) {
                totalObjects += container.getChildAt(i).numChildren;
            }
            return totalObjects > 0;
        },

        /**
         * Moves the position of the map tooltip around the canvas
         * @param cx - the canvas x coordinate to move to
         * @param cy - the canvas y coordinate to move to
         */
        moveTooltip: function (cx, cy) {
            if (mapProps.isTooltipLocked) {
                return;
            }
            !mapProps.tooltipWrapper && mapProps.initMapTooltip();

            var top = (mapProps.canvasHeightCc - cy) < mapProps.tooltipWrapper.clientHeight + mapConstants.tooltipOffsetFromMouse
                ? cy - mapProps.tooltipWrapper.clientHeight - mapConstants.tooltipOffsetFromMouse
                : cy + mapConstants.tooltipOffsetFromMouse;
            var left = (mapProps.canvasWidthCc - cx) < mapProps.tooltipWrapper.clientWidth + mapConstants.tooltipOffsetFromMouse
                ? cx - mapProps.tooltipWrapper.clientWidth - mapConstants.tooltipOffsetFromMouse
                : cx + mapConstants.tooltipOffsetFromMouse;

            mapProps.tooltipWrapper.style.top = top + 'px';
            mapProps.tooltipWrapper.style.left = left + 'px';
        },

        /**
         * Formats a string/number of seconds into a string in the format: hh:mm:ss
         * @param seconds
         * @returns {string}
         */
        formatTime: function (seconds) {
            seconds = parseInt(seconds, 10);
            return [
                Math.floor(seconds / 3600), // hours
                Math.floor(seconds / 60) % 60, // minutes
                seconds % 60 // seconds
            ].map(function (value) {
                return ('0' + value).slice(-2); // append 0 in front of values that are less than 10
            }).join(':');
        },

        /**
         * Returns the move distance that the global canvas position has to move based on the chosen direction
         * @param direction
         * @returns {{globalCx: number, globalCy: number}}
         */
        getMoveDistanceBasedOnDirection: function (direction) {
            switch (direction) {
                case mapConstants.moveDirection.north:
                    return { globalCx: 0, globalCy: -mapProps.canvasHeightCc };
                case mapConstants.moveDirection.northEast:
                    return { globalCx: mapProps.canvasWidthCc / 2, globalCy: -mapProps.canvasHeightCc / 2 };
                case mapConstants.moveDirection.east:
                    return { globalCx: mapProps.canvasWidthCc, globalCy: 0 };
                case mapConstants.moveDirection.southEast:
                    return { globalCx: mapProps.canvasWidthCc / 2, globalCy: mapProps.canvasHeightCc / 2 };
                case mapConstants.moveDirection.south:
                    return { globalCx: 0, globalCy: mapProps.canvasHeightCc };
                case mapConstants.moveDirection.southWest:
                    return { globalCx: -mapProps.canvasWidthCc / 2, globalCy: mapProps.canvasHeightCc / 2 };
                case mapConstants.moveDirection.west:
                    return { globalCx: -mapProps.canvasWidthCc, globalCy: 0 };
                case mapConstants.moveDirection.northWest:
                    return { globalCx: -mapProps.canvasWidthCc / 2, globalCy: -mapProps.canvasHeightCc / 2 };
            }
        },

        /**
         * Adds the events for the map ui elements
         * such as map move arrows, home button, open minimap etc.
         */
        addMapUIEvents: function () {
            // map move arrows events
            Array.prototype.forEach.call(document.getElementsByClassName('map-move-arrow'), function (arrow) {
                arrow.addEventListener('click', function () {
                    var moveDistance = mapMethods.getMoveDistanceBasedOnDirection(this.getAttribute('data-move-direction'));
                    mapMethods.moveByGlobalCC(moveDistance);
                }, false);
            });
            
            // map buttons events
            document.getElementById('map-button-cards').addEventListener('click', function () {
                mapMethods.toggleCards();
            }, false);

            document.getElementById('map-button-home').addEventListener('click', function () {
                mapMethods.goToGc(mapProps.homeX, mapProps.homeY);
            }, false);

            document.getElementById('map-button-screenshot').addEventListener('click', function () {
                mapMethods.screenshot();
            }, false);

            document.getElementById('map-button-minimap').addEventListener('click', function () {
                minimap.toggle();
            }, false);
        },

        /**
         * Moves the map position based on a set distance in the format of {globalCx, globalCy}
         * Moves the map not by jumping, but by sliding in X steps for Y time
         * @param distance
         */
        moveByGlobalCC: function (distance) {
            if (mapProps.isMapMoving) {
                return;
            }
            mapProps.isMapMoving = true;
            var steps = 20;
            var timeoutBetweenSteps = 40;
            var distanceSingleStep = {
                globalCx: Math.round(distance.globalCx / steps),
                globalCy: Math.round(distance.globalCy / steps)
            };

            for (var s = 0; s < steps; s++) {
                setTimeout(function () {
                    distanceSingleStep = mapMethods.getConfinedDistance(distanceSingleStep);
                    mapProps.canvasPositionGlobalCx += distanceSingleStep.globalCx;
                    mapProps.canvasPositionGlobalCy += distanceSingleStep.globalCy;

                    mapProps.canvasCenterGlobalCx = mapProps.canvasPositionGlobalCx + mapProps.canvasWidthCc / 2;
                    mapProps.canvasCenterGlobalCy = mapProps.canvasPositionGlobalCy + mapProps.canvasHeightCc / 2;

                    mapProps.layers.objects.set({
                        x: mapProps.layers.objects.x - distanceSingleStep.globalCx,
                        y: mapProps.layers.objects.y - distanceSingleStep.globalCy
                    });

                    mapProps.layers.missions.set({
                        x: mapProps.layers.missions.x - distanceSingleStep.globalCx,
                        y: mapProps.layers.missions.y - distanceSingleStep.globalCy
                    });

                    mapMethods.draw();
                }, s * timeoutBetweenSteps);
            }
            setTimeout(function () {
                mapMethods.loadBlocksAroundGlobalCx(mapProps.canvasPositionGlobalCx, mapProps.canvasPositionGlobalCy);
                mapProps.isMapMoving = false;
            }, steps * timeoutBetweenSteps);
        },

        /**
         * Calculates whether a move distance is allowed
         * to prevent the user from moving the canvas outside of the map bounds
         *
         * returns the allowed move distance ( 0 if you cannot move somewhere )
         * @param distance {{globalCx: *, globalCy: *}}
         * @returns {{globalCx: *, globalCy: *}}
         */
        getConfinedDistance: function (distance) {
            // You are on the left edge of the map - only positive distanceX is allowed
            if (mapProps.canvasPositionGlobalCx <= 0) {
                distance.globalCx = Math.max(0, distance.globalCx);
            }
            // You are on the top edge of the map - only positive distanceY is allowed
            if (mapProps.canvasPositionGlobalCy <= 0) {
                distance.globalCy = Math.max(0, distance.globalCy);
            }
            // You are on the right edge of the map - only negative distanceX is allowed
            if (mapProps.canvasPositionGlobalCx >= mapProps.maxCanvasPositionGlobalCx) {
                distance.globalCx = Math.min(0, distance.globalCx);
            }
            // You are on the bottom edge of the map - only negative distanceY is allowed
            if (mapProps.canvasPositionGlobalCy >= mapProps.maxCanvasPositionGlobalCy) {
                distance.globalCy = Math.min(0, distance.globalCy);
            }

            return distance;
        },

        /**
         * Toggles the display of the user cards on the map
         */
        toggleCards: function () {
            mapProps.areCardsOn = !mapProps.areCardsOn;

            var method = mapProps.areCardsOn ? 'remove' : 'add';
            Array.prototype.forEach.call(document.getElementsByClassName('map-user-card'), function (card) {
                card.classList[method]('map-card-hidden');
            });
        },

        /**
         * Moves the map directly to game coordinates
         * @param x - the x game coordinate to move to
         * @param y - the y game coordinate to move to
         */
        goToGc: function (x, y) {
            // just a small debounce so that dragging the pointer on the minimap would not send enormous amount of requests
            clearTimeout(this.goToTo);
            this.goToTo = setTimeout(function () {
                this.clearObjects();
                this.positionMapCanvasToGc(x, y);
                this.positionLayers();
                this.loadBlocksAroundGc(x, y).then(function () {
                    mapMethods.draw();
                });
            }.bind(this), 50);

        },

        /**
         * Moves the map directly to game coordinates
         * @param quadrantX - the x coordinate of the quadrant in the quadrant matrix
         * @param quadrantY - the y coordinate of the quadrant in the quadrant matrix
         */
        goToQuadrant: function (quadrantX, quadrantY) {
            var x = Math.round(quadrantX * mapConstants.quadrantWidthGc - mapConstants.quadrantWidthGc / 2);
            var y = Math.round(quadrantY * mapConstants.quadrantHeightGc - mapConstants.quadrantHeightGc / 2);
            return this.goToGc(x, y);
        },

        /**
         * Makes a screenshot of the current visible canvas and saves it as map.jpg
         */
        screenshot: function () {
            var imageSize = {
                width: mapProps.canvasWidthCc,
                height: mapProps.canvasHeightCc
            };
            mapProps.stage.cache(
                0,
                0,
                imageSize.width,
                imageSize.height
            );
            var image = mapProps.stage.cacheCanvas.toDataURL('image/jpeg');
            mapProps.stage.uncache();
            var link = document.createElement('a');
            link.setAttribute('download', 'map.jpg');
            link.setAttribute('href', image);
            link.click();
        },

        /**
         * Returns type of the colony based on the raceId
         * @param raceId - the race id we want the colony image for
         * @returns {string|number}
         */
        getColonyTypeByRace: function (raceId) {
            raceId = raceId || mapConstants.races.imperian;
            return mapResources.objectsConfig.colonyTypesByRace[raceId];
        },

        /**
         * Returns whether a colony is over a special resource based on a object type
         * @param type - the type of the object (colony)
         * @returns {boolean}
         */
        isColonyOverResource: function (type) {
            return !this.isTypeColony(type);
        },

        /**
         * Returns whether a certain object type is a colony
         * @param type - the object type in question
         * @returns {boolean}
         */
        isTypeColony: function (type) {
            var isTypeColony = false;
            for (var raceId in mapResources.objectsConfig.colonyTypesByRace) {
                if (
                    mapResources.objectsConfig.colonyTypesByRace.hasOwnProperty(raceId)
                    && mapResources.objectsConfig.colonyTypesByRace[raceId] == type
                ) {
                    isTypeColony = true;
                    break;
                }
            }
            return isTypeColony;
        },

        /**
         * Inits the minimap, creates the filter elements and add the events on them
         */
        initMinimap: function () {
            minimap.init();
            if (
                mapResources.minimapActionsConfig.searchTypeObjects
                && mapResources.minimapActionsConfig.searchTypeObjects.length
            ) {
                mapFactory.createMinimapFilters(mapResources.minimapActionsConfig.searchTypeObjects);
                minimap.addEvents();
            }
        },

        /**
         * Show the available actions map tooltip when a map object is interacted (clicked)
         * @param actions - an array of action ids that are available for this object
         * @param objectId - the id of the map object
         * @param x - the x game coordinate of the map object
         * @param y - the y game coordinate of the map object
         */
        showActionsTooltip: function (actions, objectId, x, y) {
            mapProps.isTooltipLocked = true;
            var actionFragment = document.createDocumentFragment();
            actions.forEach(function (actionId) {
                var actionConfig = mapResources.actionsConfig[actionId];
                if (actionConfig) {
                    var actionWrapper = document.createElement('div');
                    actionWrapper.classList.add('map-tooltip-key');
                    actionWrapper.onclick = function () {
                        if (actionId === mapConstants.clientAction.showOnMap) {
                            mapMethods.goToGc(x, y);
                        } else if (actionId === mapConstants.clientAction.createBase) {
                            window[actionConfig.callback](actionId, [x, y].join('_'));
                        } else {
                            window[actionConfig.callback](actionId, objectId);
                        }
                        mapProps.isTooltipLocked = false;
                        mapProps.tooltipWrapper.innerHTML = '';
                    };
                    actionWrapper.innerHTML = actionConfig.title;
                    actionFragment.appendChild(actionWrapper);
                }
            });

            while (mapProps.tooltipWrapper.firstChild) {
                mapProps.tooltipWrapper.removeChild(mapProps.tooltipWrapper.firstChild);
            }
            mapProps.tooltipWrapper.appendChild(actionFragment);
        }
    };

    var mapFactory = {
        /**
         * Creates bitmap with the map background
         * @param cx - x canvas coordinate of the bitmap
         * @param cy - y canvas coordinate of the bitmap
         * @returns {createjs.Bitmap}
         */
        background: function (cx, cy) {
            if (mapResources.assets.background) {
                var bmp = new createjs.Bitmap(mapResources.assets.background);
                bmp.set({
                    x: cx - 0.5,
                    y: cy - 0.5
                });

                return bmp;
            }

            throw new MapException('Background asset not loaded!');
        },

        /**
         * Returns a container name based on a block id
         * @param blockId
         * @returns {string}
         */
        getBlockContainerName: function (blockId) {
            return 'c' + blockId;
        },

        /**
         * Returns a block id based on container name
         * @param containerName
         * @returns {number}
         */
        getBlockIdFromContainerName: function (containerName) {
            return parseInt(containerName.substr(1));
        },

        /**
         * Returns a subcontainer name based on block id and subcontainer type
         * @param blockId
         * @param subContainerType
         * @returns {string}
         */
        getBlockSubContainerName: function (blockId, subContainerType) {
            return this.getBlockContainerName(blockId) + '-' + subContainerType;
        },

        /**
         * Creates a block container ( craetejs.Container holding all of the objects in a certain block on the map)
         * @param blockId - the id of the block
         * @returns {createjs.Container}
         */
        blockContainer: function (blockId) {
            var blockContainerName = this.getBlockContainerName(blockId);
            var blockContainer = mapProps.layers.objects.getChildByName(blockContainerName);

            if (!blockContainer) {
                blockContainer = new createjs.Container();
                blockContainer.set({
                    name: blockContainerName
                });
                mapProps.layers.objects.addChild(blockContainer);
                mapConstants.layersInABlock.forEach(function (layer) {
                    var container = new createjs.Container();
                    container.set({
                        name: mapFactory.getBlockSubContainerName(blockId, layer)
                    });
                    blockContainer.addChild(container);
                });
            }

            return blockContainer;
        },

        /**
         * Creates the tooltip that is diplay when a user rollovers a map object
         * @param tooltipData
         * @returns {string}
         */
        createTooltip: function (tooltipData) {
            return [
                '<div>'
            ].concat(tooltipData.map(function (tooltipRow) {
                var value = tooltipRow.vl || tooltipRow.value;
                if (tooltipRow.key !== '' && value !== '') {
                    return '<div><span class="map-tooltip-key">' + tooltipRow.key + ': </span><span class="map-tooltip-value">' + value + '</span></div>';
                } else {
                    return '';
                }
            })).concat([
                '</div>'
            ]).join('');
        },

        /**
         * Creates the color polygon under the colony image
         * @param color - the color of the polygon
         * @returns {createjs.Shape}
         */
        createColonyPolygon: function (color) {
            var hexColor = (color + '').replace(/0x/g, '#');
            var polygon = new createjs.Shape();
            polygon.graphics.beginStroke(hexColor);
            polygon.graphics.beginFill(hexColor);
            polygon.graphics.moveTo(0, 19).lineTo(28, 2).lineTo(60, 19).lineTo(30, 37).lineTo(0, 20);

            return polygon;
        },

        /**
         * Creates a timer or the map.
         * Inserts the html element in the DOM
         * Reloads the block when the timer is over
         * @param seconds - the seconds for the timer
         * @param blockId - the block id of the block holding the timer so that it is reloaded after the timer is over
         * @returns {createjs.DOMElement}
         */
        createMapTimer: function (seconds, blockId) {
            var timerElement = document.createElement('div');
            timerElement.classList.add('map-timer');
            timerElement.classList.add('map-dom-element-' + blockId);
            timerElement.innerText = mapMethods.formatTime(seconds);
            mapProps.timers.push(setInterval(function () {
                seconds--;
                timerElement.innerText = mapMethods.formatTime(seconds);

                if (seconds <= 0) {
                    mapMethods.updateBlock(blockId);
                }
            }, 1000));
            mapProps.canvas.parentNode.appendChild(timerElement);
            return new createjs.DOMElement(timerElement);
        },

        /**
         * Creates the map card for the user capitals
         * Inserts the html element in the DOM
         * @param data
         * @param blockId
         * @returns {createjs.DOMElement}
         */
        createMapCard: function (data, blockId, userId) {
            if (data.ttp && data.ttp.length) {
                var username = data.ttp[0].vl || '';
                var race = data.race;
                var points = data.ttp[1] ? data.ttp[1].vl : '';
                var alliance = data.ttp[2] ? data.ttp[2].vl : '';
                var avatar = data.thumb;

                var card =
                    '<div class="map-user-name"><strong onclick="javascript:void(xajax_showGameProfiles(containersStuff.findContaner({saveName:\'profiles\',positionVisibleScreen:true}),\'NULL\',' + userId + '))">' + username + '</strong><span class="fright map-card-close"></span></div>'+
                    '<table>' +
                        '<tr><td rowspan="3"><img src="' + avatar + '" alt="' + username + '" onclick="javascript:void(xajax_showGameProfiles(containersStuff.findContaner({saveName:\'profiles\',positionVisibleScreen:true}),\'NULL\',' + userId + '))"></td><td class="tright">' + race + '</td></tr>' +
                        '<tr><td class="tright">' + points + '</td></tr>' +
                        '<tr><td class="tright">' + alliance + '</td></tr>' +
                    '</table>';
                var cardElement = document.createElement('div');
                cardElement.classList.add('map-user-card');
                cardElement.classList.add('map-dom-element-' + blockId);
                cardElement.insertAdjacentHTML('beforeend', card);
                mapProps.canvas.parentNode.appendChild(cardElement);
                cardElement.querySelector('.map-card-close').addEventListener('click', function () {
                    cardElement.classList.add('map-card-hidden');
                });

                return new createjs.DOMElement(cardElement);
            }
        },

        /**
         * Creates and appends the html for all of the available map filters
         * @param filters
         */
        createMinimapFilters: function (filters) {
            filters = JSON.parse(JSON.stringify(filters));
            var filterTable = document.getElementById('map-minimap-filter-table');
            var numberSubmitName = '';
            while (filters.length) {
                var filter = filters.shift();
                switch (filter.type) {
                    /**
                     * This is the type of filter that is represented with radio buttons
                     * It may have sub-filters that are shown only when a specific radio button is checked
                     * This will also add the change event to the inputs
                     */
                    case mapConstants.minimapFilterType.radio:
                        var html = mapFactory.minimapFilter.createRadio(filter);
                        var filterWrapper = document.getElementById('map-minimap-filter-range-distance');
                        filterWrapper.innerHTML += html;

                        // add the search button if not added ( one per group of inputs of type radio )
                        var filterSearchButton = filterTable.querySelector('#minimap-range-distance-submit');
                        if (filterSearchButton) {
                            filterSearchButton.parentNode.removeChild(filterSearchButton);
                        }
                        filterTable.innerHTML += '<tr><td colspan="2"></td>' +
                            mapFactory.minimapFilter.createButton('minimap-range-distance-submit', filter.submitName) +
                            '</tr>';

                        // check the first of each radio group
                        Array.prototype.forEach.call(filterWrapper.getElementsByClassName('minimap-filter-group'), function (filterGroup) {
                            var radios = filterGroup.querySelectorAll('input[type="radio"]');
                            radios && radios.length && (radios[0].checked = true);
                        });

                        (function (filterWrapper) {
                            var leftColumnRadioInputs = filterWrapper
                                .querySelector('.minimap-filter-group:first-child')
                                .querySelectorAll('input[type="radio"]');
                            Array.prototype.forEach.call(leftColumnRadioInputs, function (radioInput) {
                                radioInput.addEventListener('change', function () {
                                    var childFilters = filterWrapper.querySelectorAll('[data-parent-id="' + this.id + '"]');
                                    if (childFilters.length && this.checked) {
                                            Array.prototype.forEach.call(childFilters, function (childFilter) {
                                            childFilter.classList.remove('not-visible');
                                        });
                                    } else {
                                        Array.prototype.forEach.call(filterWrapper.querySelectorAll('[data-parent-id]'), function (childFilter) {
                                            childFilter.classList.add('not-visible');
                                        });
                                    }
                                });
                            });
                        }(filterWrapper));
                        numberSubmitName = filter.submitName;
                        break;

                    case mapConstants.minimapFilterType.alliance:
                        filterTable.innerHTML += mapFactory.minimapFilter.createText(filter, 'minimap-alliance-submit');
                        numberSubmitName = filter.submitName;
                        break;

                    case mapConstants.minimapFilterType.user:
                        filterTable.innerHTML += mapFactory.minimapFilter.createText(filter, 'minimap-user-submit');
                        numberSubmitName = filter.submitName;
                        break;
                }
            }

            filterTable.innerHTML += mapFactory.minimapFilter.createNumber({
                submitName: numberSubmitName
            }, 'minimap-quadrant-submit');
        },

        minimapFilter: {
            createButton: function (id, value) {
                return '<td><button id="' + id + '" class="fleft minimap-filter-search-button">' + value + '</button></td>'
            },

            createRadio: function (filter, isHidden, parentId) {
                var inputGroupName = filter.name.split(' ').join('-');
                var inputGroupNameHashed = inputGroupName.hashCode();
                var subFilterHtml = '';
                var filterHtml =
                    '<div class="fleft minimap-filter-group' + (isHidden ? ' not-visible' : '') + '"' + (parentId ? ' data-parent-id="' + parentId + '"': '') + '>' +
                        '<div class="minimap-filter-row">' + filter.name + '</div>' +
                        filter.values.map(function (filterValue) {
                            var id = (inputGroupName + filterValue.val).hashCode();
                            if (filterValue.sub_menu) {
                                filterValue.sub_menu.values = filterValue.sub_menu.values.map(function (vl) {
                                    return {
                                        name: vl,
                                        val: vl
                                    };
                                });
                                subFilterHtml += mapFactory.minimapFilter.createRadio(filterValue.sub_menu, true, id);
                            }
                            return '<div class="minimap-filter-row"><input type="radio" id="' + id + '" class="minimap-input" name="' + inputGroupNameHashed + '" value="' + filterValue.val + '" />&nbsp;' +
                                '<label for="' + id + '">' + filterValue.name + '</label></div>';
                        }).join('') +
                    '</div>';
                return (filterHtml + subFilterHtml);
            },
            
            createText: function (filter, buttonId) {
                return '<tr>' +
                        '<td colspan="2">' + filter.name + '</td>' +
                        '<td>' + (filter.checkBoxName ? this.createCheckbox(filter.checkBoxName, buttonId) : '') + '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td colspan="2"><input type="text" value="' + filter.value + '" id="' + buttonId + '-input"/></td>' +
                        this.createButton(buttonId, filter.submitName) +
                    '</tr>';
            },

            createCheckbox: function (name, buttonId) {
                var id = name.hashCode();
                return '<input type="checkbox" id="' + buttonId + '-checkbox" id="' + id + '"/>' +
                    '<label for="' + id + '">' + name + '</label>';
            },

            createNumber: function (filter, buttonId) {
                return '<tr>' +
                        '<td>X: <input type="number" id="' + buttonId + '-x" min="0" max="' + mapConstants.mapWidthQuadrants + '"/></td>' +
                        '<td>Y: <input type="number" id="' + buttonId + '-y"  min="0" max="' + mapConstants.mapHeightQuadrants + '"/></td>' +
                        this.createButton(buttonId, filter.submitName) +
                    '</tr>';
            }
        }
    };

    var minimap = {
        isOpen: false,
        zoomFactor: 1.5,
        isZoomOn: false,
        element: null,
        canvas: {
            element: undefined,
            width: 0,
            height: 0
        },
        zoomCanvas: {
            element: undefined,
            wrapper: undefined,
            width: 0,
            height: 0,
            top: 200,
            left: 200
        },
        stage: null,
        zoomStage: null,
        container: null,
        zoomContainer: null,
        isZoomCanvasDragged: false,
        isFilterAllianceCastles: false,
        isPointerDown: false,
        objectClicked: false,

        /**
         * Inits the minimap, as well as add the stage's events
         */
        init: function () {
            this.element = document.getElementById('map-minimap');
            if (!this.element) {
                throw new MapException('Cannot init minimap, html element#map-minimap is missing');
            }

            this.canvas.element = document.getElementById('minimap-canvas');
            if (!this.canvas.element) {
                throw new MapException('Cannot init minimap, html element#minimap-canvas is missing');
            }

            this.zoomCanvas.element = document.getElementById('minimap-canvas-zoom');
            if (!this.zoomCanvas.element) {
                throw new MapException('Cannot init minimap, html element#minimap-canvas-zoom is missing');
            }
            this.zoomCanvas.wrapper = document.getElementById('minimap-zoom-wrapper');

            this.canvas.width = this.canvas.element.clientWidth;
            this.canvas.height = this.canvas.element.clientHeight;

            this.zoomCanvas.width = this.zoomCanvas.element.clientWidth;
            this.zoomCanvas.height = this.zoomCanvas.element.clientHeight;

            this.stage = new createjs.Stage(this.canvas.element);
            this.zoomStage = new createjs.Stage(this.zoomCanvas.element);

            this.container = new createjs.Container();
            this.zoomContainer = new createjs.Container();
            this.zoomContainer.set({
                scaleX: this.zoomFactor,
                scaleY: this.zoomFactor,
                x: ((this.zoomCanvas.width - this.canvas.width) / 2) * this.zoomFactor,
                y: ((this.zoomCanvas.height - this.canvas.height) / 2) * this.zoomFactor
            });
            this.stage.addChild(this.container);
            this.zoomStage.addChild(this.zoomContainer);

            this.stage.enableMouseOver(20);
            this.zoomStage.enableMouseOver(20);
            this.stage.addEventListener('stagemousedown', function (event) {
                minimap.isPointerDown = true;
            });
            this.stage.addEventListener('stagemousemove', function (event) {
                if (minimap.isPointerDown) {
                    var stageCoordinates = {
                        x: event.stageX,
                        y: event.stageY
                    };
                    var gameCoordinates = minimap.getGameCoordinates(stageCoordinates);
                    minimap.updateLocation(stageCoordinates);
                    mapMethods.goToGc(gameCoordinates.x, gameCoordinates.y);
                }
            });
            this.stage.addEventListener('stagemouseup', function (event) {
                setTimeout(function () {
                    if(!minimap.objectClicked) {
                        var stageCoordinates = {
                            x: event.stageX,
                            y: event.stageY
                        };
                        var gameCoordinates = minimap.getGameCoordinates(stageCoordinates);
                        minimap.updateLocation(stageCoordinates);
                        mapMethods.goToGc(gameCoordinates.x, gameCoordinates.y);
                    }
                    minimap.isPointerDown = false;
                    minimap.objectClicked = false;
                }, 50);
            });

            this.zoomCanvas.element.onmousedown = function () {
                minimap.isZoomCanvasDragged = true;
            };

            this.canvas.element.onmousemove = function (event) {
                minimap.moveZoom(event);
            };
            this.zoomCanvas.element.onmousemove = function (event) {
                minimap.moveZoom(event);
            };

            this.zoomCanvas.element.onmouseup = function () {
                minimap.isZoomCanvasDragged = false;
            };
            document.addEventListener('mouseup', function (ev) {
                minimap.isZoomCanvasDragged = false;
            }, false);

            this.element.addEventListener('click', function () {
                if (!minimap.objectClicked) {
                    mapProps.tooltipWrapper.innerHTML = '';
                    mapProps.isTooltipLocked = false;
                }
                setTimeout(function () {
                    minimap.objectClicked = false;
                }, 50);
            }, false);
        },

        /**
         * Toggles the display of the minimap
         */
        toggle: function () {
            this.isOpen ? this.close() : this.open();
        },

        /**
         * Opens the minimap
         */
        open: function () {
            if (minimap.container.children.length === 0) {
                mapMethods.get('json/minimap.php').then(function (response) { minimap.display(response); });
            }
            this.element.classList.add('minimap-open');
            this.isOpen = true;
        },

        /**
         * Closes the minimap
         */
        close: function () {
            this.element.classList.remove('minimap-open');
            this.isOpen = false;
            this.isFilterAllianceCastles = false;
        },

        toggleZoom: function () {
            this.isZoomOn ? this.closeZoom() : this.openZoom();
        },

        closeZoom: function () {
            this.zoomCanvas.wrapper.classList.remove('zoom-visible');
            this.isZoomOn = false;
        },

        openZoom: function () {
            this.centerZoom();
            this.zoomCanvas.wrapper.classList.add('zoom-visible');
            this.isZoomOn = true;
        },

        centerZoom: function () {
            this.zoomCanvas.top = 200;
            this.zoomCanvas.left = 200;

            this.zoomCanvas.wrapper.style.top = this.zoomCanvas.top + 'px';
            this.zoomCanvas.wrapper.style[mapProps.isRTL ? 'right' : 'left'] = this.zoomCanvas.left + 'px';

            this.zoomContainer.set({
                x: ((this.zoomCanvas.width - this.canvas.width) / 2) * this.zoomFactor,
                y: ((this.zoomCanvas.height - this.canvas.height) / 2) * this.zoomFactor
            });
            this.zoomStage.update();
        },

        moveZoom: function (event) {
            if (minimap.isZoomCanvasDragged) {
                minimap.zoomCanvas.top += event.movementY;
                minimap.zoomCanvas.left += event.movementX * (mapProps.isRTL ? -1 : 1);
                minimap.zoomCanvas.top = Math.max(0, Math.min(400, minimap.zoomCanvas.top));
                minimap.zoomCanvas.left = Math.max(0, Math.min(400, minimap.zoomCanvas.left));

                minimap.zoomCanvas.wrapper.style.top = minimap.zoomCanvas.top + 'px';
                minimap.zoomCanvas.wrapper.style[mapProps.isRTL ? 'right' : 'left'] = minimap.zoomCanvas.left + 'px';
                minimap.zoomContainer.x -= (event.movementX * minimap.zoomFactor);
                minimap.zoomContainer.y -= (event.movementY * minimap.zoomFactor);
                minimap.zoomStage.update();
            }
        },

        /**
         * Adds events for the minimap filters
         */
        addEvents: function () {
            document.getElementById('minimap-quadrant-submit').addEventListener('click', function () {
                minimap.isFilterAlliance = false;
                var qcx = document.getElementById(this.id + '-x').value;
                var qcy = document.getElementById(this.id + '-y').value;
                mapMethods.goToQuadrant(
                    Math.min(Math.max(qcx, 0), mapConstants.mapWidthQuadrants),
                    Math.min(Math.max(qcy, 0), mapConstants.mapHeightQuadrants)
                );
            }, false);

            document.getElementById('map-minimap-close').onclick = minimap.close.bind(minimap);

            var rangeDistanceSubmit = document.getElementById('minimap-range-distance-submit');
            rangeDistanceSubmit && rangeDistanceSubmit.addEventListener('click', function () {
                var abandonedFilter = document.querySelector('.minimap-filter-group:nth-child(2)');
                var abandonedRadio = abandonedFilter.querySelector('input[type="radio"]:checked');
                var allAbandonedRadiosAsArray = Array.prototype.slice.call(abandonedFilter.querySelectorAll('input[type="radio"]'));
                var abandonedValue = allAbandonedRadiosAsArray.indexOf(abandonedRadio);

                if (abandonedFilter.classList.contains('not-visible')) {
                    abandonedValue = -1;
                }
                var filterType = parseInt(document.querySelector('.minimap-filter-group:nth-child(1) input[type="radio"]:checked').value, 10);
                mapMethods.log('[filterType]', filterType);
                minimap.isFilterAllianceCastles = (filterType === mapConstants.filterType.allianceCastles);
                minimap.isFilterAlliance = (filterType > 9);
                reloadMiniMap(
                    filterType,
                    1,
                    parseInt(document.querySelector('.minimap-filter-group:nth-child(3) input[type="radio"]:checked').value, 10),
                    0,
                    abandonedValue
                );
            }, false);

            var allianceSubmit = document.getElementById('minimap-alliance-submit');
            allianceSubmit && allianceSubmit.addEventListener('click', function () {
                minimap.isFilterAlliance = true;
                var allianceName = document.getElementById('minimap-alliance-submit-input').value;
                var compare = document.getElementById('minimap-alliance-submit-checkbox').checked;
                xajax_findHoleAlliance(0, false, allianceName, compare);
            }, false);

            //findUserOnMap
            var userSubmit = document.getElementById('minimap-user-submit');
            userSubmit && userSubmit.addEventListener('click', function () {
                minimap.isFilterAlliance = false;
                var userName = document.getElementById('minimap-user-submit-input').value;
                xajax_findUserOnMap(0, false, userName);
            }, false);

            // minimap zoom
            document.getElementById('map-minimap-zoom').onclick = minimap.toggleZoom.bind(minimap);
            document.getElementById('map-minimap-zoom-close').onclick = minimap.closeZoom.bind(minimap);
        },

        /**
         * Returns coordinates in the minimap canvas stage based on game coordinates
         * @param gameCoordinates {{x: number, y: number}}
         * @returns {{x: number, y: number}}
         */
        getStageCoordinates: function (gameCoordinates) {
            gameCoordinates.x = parseInt(gameCoordinates.x, 10);
            gameCoordinates.y = parseInt(gameCoordinates.y, 10);

            return {
                x: this.canvas.width * gameCoordinates.x / mapConstants.mapWidthGc,
                y: this.canvas.height * gameCoordinates.y / mapConstants.mapHeightGc
            };
        },

        /**
         * Returns game coordinates based on minimap canvas stage coordinates
         * @param stageCoordinates {{x: number, y: number}}
         * @returns {{x: number, y: number}}
         */
        getGameCoordinates: function (stageCoordinates) {
            stageCoordinates.x = parseInt(stageCoordinates.x, 10);
            stageCoordinates.y = parseInt(stageCoordinates.y, 10);

            return {
                x: stageCoordinates.x * mapConstants.mapWidthGc / this.canvas.width,
                y: stageCoordinates.y * mapConstants.mapHeightGc / this.canvas.height
            };
        },

        /**
         * Returns the minimap object by it's type
         * @param type - the type of the object
         * @returns {createjs.Shape|createjs.Bitmap}
         */
        getMinimapObjectByType: function (type) {
            var image = mapResources.assets['minimap-object-type-' + type];
            if (image) {
                return new createjs.Bitmap(image);
            }
            switch (type) {
                case 1:
                default:
                    var shape = new createjs.Shape(new createjs.Graphics().beginFill(minimap.isFilterAlliance ? '#ff0000' : '#a6d2ff').drawRect(0, 0, 4, 4));
                    /**
                     * Shape Does not currently support automatic bounds calculations. Use setBounds() to manually define bounds.
                     */
                    shape.setBounds(0, 0, 4, 4);
                    return shape
            }
        },

        /**
         * Displays the results of a search on the minimap canvas
         * @param minimapResponse - the minimap objects response
         */
        display: function (minimapResponse) {
            mapMethods.log('minimapResponse', minimapResponse);
            this.container.removeAllChildren();
            this.zoomContainer.removeAllChildren();

            if (this.isFilterAllianceCastles
                && mapResources.minimapActionsConfig.influence
                && mapResources.minimapActionsConfig.influence.length
            ) {
                // Draw the influence circles
                mapResources.minimapActionsConfig.influence.forEach(function (influenceData) {
                    var stageCoordinates = minimap.getStageCoordinates({
                        x: influenceData.X,
                        y: influenceData.Y
                    });
                    var g = new createjs.Graphics();
                    g.beginFill(influenceData.C.replace(/0x/g, '#') + '22');
                    g.drawCircle(stageCoordinates.x, stageCoordinates.y, influenceData.R);
                    minimap.container.addChild(new createjs.Shape(g));
                });
            }

            minimapResponse.objects && minimapResponse.objects.length && minimapResponse.objects.forEach(function (object) {
                minimap.container.addChild(minimap.getObjectBitmap(object));
                minimap.zoomContainer.addChild(minimap.getObjectBitmap(object));
            });
            minimap.stage.update();
            minimap.zoomStage.update();
            minimap.toggleDistanceDisplay(minimapResponse.dist);
        },

        getObjectBitmap: function (object) {
            var stageCoordinates = minimap.getStageCoordinates(object);
            var objectBmp = minimap.getMinimapObjectByType(object.type);
            var bounds = objectBmp.getBounds() || {
                width: 0,
                height: 0
            };
            objectBmp.set({
                regX: bounds.width / 2,
                regY: bounds.height / 2,
                x: stageCoordinates.x,
                y: stageCoordinates.y,
                cursor: 'pointer'
            });
            var tooltip = mapFactory.createTooltip(object.tooltip);
            objectBmp.addEventListener('rollover', function () {
                // show tooltip
                clearTimeout(mapProps.showTooltipTimeout);
                mapProps.showTooltipTimeout = setTimeout(function () {
                    mapProps.isTooltipLocked = false;
                    mapProps.tooltipWrapper.innerHTML = tooltip;
                    mapMethods.moveTooltip(mapProps.pointer.stage.cx, mapProps.pointer.stage.cy);
                }, mapConstants.showTooltipDelay);
            });

            objectBmp.addEventListener('rollout', function () {
                // hide tooltip
                if (!mapProps.isTooltipLocked) {
                    mapProps.tooltipWrapper.innerHTML = '';
                }
            });
            if (object.acs && object.acs.length) {
                objectBmp.addEventListener('click', function (event) {
                    minimap.objectClicked = true;
                    mapMethods.showActionsTooltip(object.acs, object.id, object.real_x, object.real_y);
                    event.stopPropagation();
                });
            } else {
                objectBmp.addEventListener('click', function (event) {
                    minimap.objectClicked = true;
                    minimap.updateLocation(stageCoordinates);
                    mapMethods.goToGc(object.x, object.y);
                    event.stopPropagation();
                });
            }
            return objectBmp;
        },

        /**
         * Upldates the location quare on the minimap and
         * @param stageCoordinates {{x:number, y:number}}
         */
        updateLocation: function (stageCoordinates) {
            var shape = new createjs.Shape(new createjs.Graphics().setStrokeStyle(1).beginStroke('#FF0000').drawRect(0, 0, 8, 8));
            shape.set({
                x: stageCoordinates.x - 4,
                y: stageCoordinates.y - 4,
                name: 'minimap-location'
            });
            minimap.container.removeChild(minimap.container.getChildByName('minimap-location'));
            minimap.container.addChildAt(shape, 0);
            minimap.stage.update();
        },

        toggleDistanceDisplay: function (distanceString) {
            var distanceHtml = '';
            if (distanceString) {
                distanceHtml = mapProps.strings.distance + ': ' + distanceString;
            }
            document.getElementById('minimap-distance').innerHTML = distanceHtml;
        }
    };
    
    return {
        /**
         * Call this method when you want to open the map
         * @param selector - the selector of the map canvas
         * @param x - the x game coordinate of the center of the map when opened
         * @param y - the y game coordinate of the center of the map when opened
         * @param objectsConfig - the path to the objects config since it can be different for the different realms
         * @param openMinimap {bool} whether to open the minimap on map init
         * @param strings
         */
        init: function (selector, x, y, objectsConfig, openMinimap, strings) {
            x = parseInt(x, 10);
            y = parseInt(y, 10);

            mapMethods.initMapProps(selector, x, y);
            mapMethods.initMapLayers();
            mapMethods.addMapUIEvents();
            mapMethods.initMapTooltip();
            mapProps.strings = strings;

            // initial map requests for configs and assets
            mapMethods.loadConfigs(objectsConfig).then(function () {
                mapProps.areConfigsLoaded = true;
                mapMethods.preloadAssets([
                    {id: 'background', src: mapResources.objectsConfig.background}
                ].concat(mapConstants.assetsForInitialPreload)).then(function () {
                    mapMethods.loadBlocksAroundGc(x, y).then(function () {
                        mapMethods.draw();

                        // init the minimap after the first draw since it will not be needed sooner
                        mapMethods.initMinimap();

                        mapMethods.addGlobalActionsEvent();
                        if (openMinimap) {
                            minimap.open();
                        }

                        mapProps.isMapInit = true;
                    });
                });
            });
            mapProps.isMapOpen = true;
        },

        /**
         * Call this method when you close the map
         * Clears cache, times, canvas etc.
         */
        close: function () {
            if (mapProps.isMapOpen) {
                mapProps.isMapOpen = false;
                mapProps.isMapInit = false;
                mapProps.timers.forEach(function (timerId) {
                    clearTimeout(timerId);
                });
                mapProps.timers = [];
                mapProps.blocksCache = {};
                mapProps.visibleBlocks = [];
                mapProps.layers.objects.removeAllChildren();
                mapProps.layers.missions.removeAllChildren();

                createjs.Ticker.removeAllEventListeners();
                mapProps.hasTickEventBeenInit = false;
                minimap.close();
            }
        },

        /**
         * This method is called from the xajax_xx response when we need to display objects
         * on the minimap canvas, for example when we filter something
         * @param minimapResponse
         * @param isAlliance
         */
        displayMinimap: function (minimapResponse, isAlliance) {
            if (!mapProps.isMapInit) {
                setTimeout(function () {
                    map.displayMinimap(minimapResponse, isAlliance);
                }, 100);
            } else {
                minimap.isFilterAlliance = isAlliance;
                minimap.display(minimapResponse);
            }
        },

        /**
         * This method is called from the xajax_xx response when we need move the map to specific coordinates
         * for example when we search for user on the minimap
         * @param x - the x the game coordinate to move to
         * @param y - the y game coordiante to move to
         */
        goTo: function (x, y) {
            minimap.close();
            mapMethods.goToGc(x, y);
        }
    }
})();