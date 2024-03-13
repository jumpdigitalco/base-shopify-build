const Accordion = ($el, parentClass, activeClass = 'active') => {
    $el.click(function (e) {
        e.preventDefault();

        const $parent = $(this).parent(`.${parentClass}`);
        $parent.siblings().removeClass(activeClass);
        $parent.siblings().removeAttr('open');
        $parent.toggleClass(activeClass);

        if ($parent.attr('open')) {
            $parent.removeAttr('open');
        } else {
            $parent.attr('open', 'open');
        }

    });
};

export default Accordion;
