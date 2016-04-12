// Plugin for keyboard navigation at UL
(function ($) {
    $.fn.ulKeyNavigator = function (options) {
        if (!options) {
            var options = {};
        }

        var ulEl = $(this);
        var inputEl = options.input;
        var selectedClass = options.selectedClass;

        $(inputEl).unbind('keydown');
        $(inputEl).keydown(navigate);

        function navigate(e) {
            if (e.keyCode == 38) { // up
                var selected = $('.' + selectedClass);
                $(ulEl).find('li').removeClass(selectedClass);
                if (selected.prev().length == 0) {
                    selected.parent().children().last().addClass(selectedClass);
                    if (options.onSelect) {
                        options.onSelect(selected.parent().children().last());
                    }
                } else {
                    selected.prev().addClass(selectedClass);
                    if (options.onSelect) {
                        options.onSelect(selected.prev());
                    }
                }
            }
            if (e.keyCode == 40) { // down
                var selected = $('.' + selectedClass);
                $(ulEl).find('li').removeClass(selectedClass);
                if (selected.next().length == 0) {
                    selected.parent().children().first().addClass(selectedClass);
                    if (options.onSelect) {
                        options.onSelect(selected.parent().children().first());
                    }
                } else {
                    selected.next().addClass(selectedClass);
                    if (options.onSelect) {
                        options.onSelect(selected.next());
                    }
                }
            }
        }
    };
})(jQuery);