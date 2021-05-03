var avatarUploader = (function() {
    var privateObj = {
        sendTo: 'avatar_encoder.php',
        fullSizeImage: '',
        imageLoadResult: '',
        fullImageWidth: 0,
        fullImageHeight: 0,
        currentImageWidth: 0,
        currentImageHeight: 0,
        maxHeight: 394,
        maxWidth: 394,
        minHeight: 165,
        minWidth: 165,
        cropCords: {},
        isImageLoad: false,
        canvas: '#avatar-preview',
        canvasWrapper: '#avatar-wrapper',
        effectContainer: '#efects-container',
        backButton: '#back-to-crop',
        backToEffects: '#back-to-effects',
        chooseImageButton: '#choose-button',
        submitAvatar: '#submit-avatar'
    };

    privateObj['canvasTemplate'] = '<canvas id="'+ privateObj.canvas.slice(1) +'"></canvas>';

    var avatarUploader = {
        sid: null,
        type: null,
        saveName: null,

        init: function (sid, type, saveName) {
            this.sid = sid;
            this.type = type;
            this.saveName = saveName;

            this.addEvents();
        },
        loadImage: function(file, imageContainer) {
            if (!file) {
                return;
            }
            $('#crop').removeClass('hidden-controllers');
            if(privateObj.isImageLoad) {
                $(privateObj.canvasWrapper).html('');
                privateObj.isImageLoad = false;
                privateObj.fullSizeImage = '';
                privateObj.imageLoadResult = '';
                privateObj.currentImageWidth = privateObj.currentImageHeight = 0;
                privateObj.cropCords = {};
            }
            AvatarWizard.clear_error_message();
            var reader = new FileReader();
            reader.onload = function(event) {
                // Check file size
                if (event.total > 2000000) {
                    AvatarWizard.print_error_message(3);
                    $('.upload-avatar-image').show();
                    $('#crop').addClass('hidden-controllers');
                    $(privateObj.canvasWrapper).addClass('ui-hide');
                    return;
                }
                // Check file type
                if (!event.target.result.match('image/jpeg') && !event.target.result.match('image/png') && !event.target.result.match('image/gif')) {
                    AvatarWizard.print_error_message(2);
                    $('.upload-avatar-image').show();
                    $('#crop').addClass('hidden-controllers');
                    $(privateObj.canvasWrapper).addClass('ui-hide');
                    return;
                }
                privateObj.imageLoadResult = event.target.result;
                privateObj.isImageLoad = true;
                //Get image dimension
                var image = new Image();
                image.src = privateObj.imageLoadResult;

                image.onload = function() {
                    if(this.width < 165 || this.height < 165) {
                        AvatarWizard.print_error_message(1);
                        $('#crop').addClass('hidden-controllers');
                        $('.upload-avatar-image').show();
                        $('#crop').addClass('hidden-controllers');
                        $(privateObj.canvasWrapper).addClass('ui-hide');
                        return;
                    }
                    privateObj.currentImageWidth = privateObj.fullImageWidth = this.width;
                    privateObj.currentImageHeight = privateObj.fullImageHeight = this.height;
                    avatarUploader.previewImage(imageContainer);
                };
            };
            reader.readAsDataURL(file);
        },
        previewImage: function(imageContainer) {
            $(privateObj.canvasWrapper).html(privateObj.canvasTemplate);
            Caman(imageContainer, privateObj.imageLoadResult, function () {
                var imageDimension = avatarUploader.getImageDimension();
                this.resize(imageDimension);
                $('.upload-avatar-image').hide();
                $('#choose-button-link').removeClass('hidden-controllers');
                $(privateObj.canvasWrapper).removeClass('ui-hide');
                this.render(function() {
                    $(imageContainer).Jcrop({
                        onSelect: function getCoords(c) {
                            privateObj.cropCords = {
                                width: c.w,
                                height: c.h,
                                x: c.x,
                                y: c.y
                            };
                        },
                        bgColor: 'black',
                        bgOpacity: 0.4,
                        minSize: [privateObj.minWidth, privateObj.minHeight],
                        maxSize: [privateObj.maxWidth, privateObj.maxHeight],
                        setSelect: [0, 0, privateObj.currentImageWidth, privateObj.currentImageHeight],
                        aspectRatio: 1
                    });
                    $('#crop').removeClass('hidden-controllers');
                });
            });
        },
        getImageDimension: function() {
            var ratio = 0,
                maxWidth = privateObj.maxWidth,
                maxHeight = privateObj.maxHeight,
                currentWidth = privateObj.currentImageWidth,
                currentHeight = privateObj.currentImageHeight,
                newDimension = {};
            if(currentWidth > maxWidth) {
                ratio = maxWidth / currentWidth;
                currentWidth = currentWidth * ratio;
                currentHeight = currentHeight * ratio;
            }
            if(currentHeight > maxHeight) {
                ratio = maxHeight / currentHeight;
                currentWidth = currentWidth * ratio;
                currentHeight = currentHeight * ratio;
            }
            if(currentWidth < privateObj.minWidth) {
                currentWidth = privateObj.minWidth;
            }
            if(currentHeight < privateObj.minHeight) {
                currentHeight = privateObj.minHeight;
            }
            newDimension = {
                width: currentWidth,
                height: currentHeight
            };
            return newDimension;

        },
        backToCrop: function() {
            privateObj.imageLoadResult = privateObj.fullSizeImage;
            privateObj.currentImageWidth = privateObj.fullImageWidth;
            privateObj.imageLoadResult = privateObj.fullSizeImage;
            $(privateObj.effectContainer).html('');
            $(privateObj.backButton).hide();
            $(privateObj.chooseImageButton).show();
            $(privateObj.submitAvatar).hide();
            $(privateObj.canvasWrapper).html('');
            avatarUploader.previewImage(privateObj.canvas);
        },
        cropImage: function(canvas) {
            Caman(canvas, function () {
                this.crop(privateObj.cropCords.width, privateObj.cropCords.height, privateObj.cropCords.x, privateObj.cropCords.y);
                this.render(function() {
                    privateObj.fullSizeImage = privateObj.imageLoadResult;
                    privateObj.imageLoadResult = this.toBase64();

                    var newCanvas = privateObj.canvasTemplate;
                    $(privateObj.canvasWrapper).html(newCanvas);
                    Caman(canvas, privateObj.imageLoadResult, function () {
                        this.resize({
                            width: privateObj.minWidth,
                            height: privateObj.minHeight
                        });
                        this.render(function() {
                            avatarUploader.loadEffects();
                            $(privateObj.backButton).show();
                        });
                    });
                });
            });
        },
        loadEffects: function() {
            var effects = ['none', 'hemingway', 'sunrise', 'orangePeel', 'sinCity', 'crossProcess'],
                html = '';

            for (var i = 0; i < effects.length; i++) {
                var classes = '';
                if(i == 0) {
                    classes = 'active';
                }
                html += '<canvas id="effect-'+ effects[i]  +'"class="'+ classes +' effect ui-ib effect-canvas" data-effect="'+ effects[i]  +'" data-caman="'+ effects[i] +'()"></canvas>';
            }

            $(privateObj.effectContainer).html(html);

            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var canvasId = '#effect-'+ effect;
                initialCaman(canvasId, effect);
            }

            function initialCaman (canvasId, effect) {
                Caman(canvasId, privateObj.imageLoadResult, function () {
                    this.resize({
                        width: 100
                    });
                    if (effect !== 'none') {
                        this[effect]();
                    }
                    this.render(bindEvent);
                });
            }

            var bindEvent = function() {
                $('.effect-canvas').unbind().bind('click', function() {
                    var effect = $(this).attr('data-effect');
                    $('.effect-canvas').removeClass('active');
                    $(this).addClass('active');
                    avatarUploader.addImageEffect(effect);
                });
            };
        },
        addImageEffect: function(effect) {
            Caman(privateObj.canvas, function () {
                //this.reloadCanvasData();
                this.revert();
                if(effect != 'none') {
                    this[effect]();
                }
                this.render(function() {
                    privateObj.imageLoadResult = this.toBase64('jpeg');
                });
            });
        },
        sendImage: function(type, addGetparam) {
            addGetparam = addGetparam? '?SID='+addGetparam: '';
            Caman(privateObj.canvas, function () {
                this.render(function() {
                    privateObj.imageLoadResult = this.toBase64('jpeg');
                    $.ajax({
                        type: "POST",
                        url: privateObj.sendTo+addGetparam,
                        data: { image: privateObj.imageLoadResult },
                        cache: false,
                        contentType: "application/x-www-form-urlencoded",
                        success: function (result) {
                            closeAvatarWizard(type, avatarUploader.saveName);
                        },
                        error: function() { AvatarWizard.print_error_message(4); }
                    });
                });
            });
        },
        getCurrentImage: function() {
            return privateObj.imageLoadResult;
        },
        addEvents: function () {
            var imageContainer = '#avatar-preview';
            $('#choose-button, #choose-button-link').bind('click', function(e) {
                e.preventDefault();
                $('#avatar-uploader').trigger('click');
            });

            $('#avatar-uploader').bind('change', function(e) {
                e.preventDefault();
                var file = e.target.files[0];
                avatarUploader.loadImage(file, imageContainer);
            });

            $('#submit-avatar').bind('click', function(e) {
                e.preventDefault();
                avatarUploader.sendImage(avatarUploader.type, avatarUploader.sid);
                $('#back-to-effects').hide();
            });

            $('#crop').bind('click', function(e) {
                e.preventDefault();
                avatarUploader.cropImage(imageContainer);
                $('.avatar-steps span').eq(1).addClass('active');
                $('.upload-steps > p').hide();
                $('#show-preview').show();
                $('#efects-container').show();
                $('#crop').addClass('hidden-controllers');
                $('#avatar-uploader').addClass('hidden-controllers');
                $('#choose-button-link').addClass('hidden-controllers');
            });

            $('#back-to-crop').bind('click', function(e) {
                e.preventDefault();
                avatarUploader.backToCrop();
                $('.upload-steps > p').show();
                $('#show-preview').hide();
                $('#efects-container').hide();
                $('.avatar-steps span').eq(1).removeClass('active');
            });

            $('#show-preview').bind('click', function(e) {
                e.preventDefault();
                var image = avatarUploader.getCurrentImage();
                $('#user-avatar').attr('src', image);
                $('#submit-avatar').show();
                $('.avatar-steps span').eq(2).addClass('active');
                $('.preview-new-avatar').removeClass('ui-hide');
                $('.upload-steps').addClass('ui-hide');
                $('#back-to-effects').show();
            });

            $('#back-to-effects').bind('click', function(e) {
                e.preventDefault();
                $('#user-avatar').attr('src', '');
                $('.avatar-steps span').eq(2).removeClass('active');
                $('.preview-new-avatar').addClass('ui-hide');
                $('.upload-steps').removeClass('ui-hide');
            });
        }
    };
    return avatarUploader;
})();
