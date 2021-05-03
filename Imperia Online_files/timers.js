$(document).ready(function() {
    progress = new Object();
    progress.interval = false;
    progress.format = function(time, days, formatType, stopSeconds) {
        // Check formatType
        var t_ddh = "", t_hh, t_mm, t_ss;

        (formatType == true) ?  t_hh = String(parseInt(time.getTime() /3600000)) : t_hh = String(time.getUTCHours());

        t_mm = String(time.getUTCMinutes());

        t_ss = String(parseInt(time.getUTCSeconds()))

        // Format timer
        if(typeof days != 'undefined' && days.length > 1 && formatType == false) {
            if(t_hh == 23 && t_mm == 59 && t_ss == 59) {
                days[0] -= 1;
            }
            (days[0] == 0) ? t_ddh = "" : t_ddh = days[0] + " " + days[1] + " ";
        }
        if(t_hh.length == 1) { t_hh = "0" + t_hh; }
        if(t_mm.length == 1) { t_mm = "0" + t_mm; }
        if(t_ss.length == 1) { t_ss = "0" + t_ss; }
        var result = '';
        if (stopSeconds) {
            result = t_ddh + t_hh + '<span class="presentClock">:</span>' + t_mm;
        } else {
            result = t_ddh + t_hh + ":" + t_mm + ":" + t_ss;
        }
        return result;
    }
    progress.blinkStarted = false
    progress.init = function() {
        // Check if interval exists otherwise set it
        if(progress.interval == false) {
            progress.interval = setInterval(function() {
                // Check for countdowns, progress otherwise kill the interval
                if($(".countdown, .in-progress, .progress").size() > 0) {
                    // Get all countdowns
                    $(".countdown").each(function() {
                        var now = parseInt($(this).attr("now"));
                        var formatType = $(this).hasClass("toHours");
                        var stopSeconds = $(this).hasClass("stopSeconds");

                        if(now >= -1) {
                            now = now - 1;
                            // Check for timer end
                            if(now < 0) {
                                eval($(this).attr("exec"));
                                $(this).removeClass("countdown");
                            } else {
                                // Make date object and output the new timer
                                var timer = new Date(now * 1000);

                                // Sets the new time
                                $(this).attr("now", now);
                                // Assign timer parts
                                var t_dd = $(this).html().replace(/^\s+|\s+$/g, "").split(" ");
                                $(this).html(progress.format(timer, t_dd, formatType, stopSeconds));
                                if (stopSeconds && progress.blinkStarted == false) {
                                    toggleClass('.presentClock', 'hide', 498);
                                    progress.blinkStarted = true;
                                }
                            }
                        } else {
                            $(this).html("00:00:00");
                        }
                    });

                    // Get all progress bars
                    $(".progressbar").each(function() {
                        var start = parseInt($(this).attr("start"));
                        var now = parseInt($(this).attr("now")) - 1;

                        if(now > -1 && !($(this).hasClass("paused"))) {
                            // Sets the new time
                            $(this).attr("now", now);

                            // Calculate the completation %
                            var complate = 100 - Math.ceil((now / start) * 100);
                            if(Math.ceil((100 * parseFloat($(".done", this).css("width")) / parseFloat($(".done", this).parent().css("width")))) < complate) {
                                if(complate <= 95) {
                                    $("span", this).text(complate + "%").animate({"left": complate + "%"}, 400);
                                } else {
                                    $("span", this).text("");
                                }

                                $(".done", this).animate({
                                    width: complate + "%"
                                }, 400);

                            }
                        }
                    });
                } else {
                    clearTimeout(progress.interval);
                    progress.interval = false;
                }
            }, 1000);
        }
    };
});
