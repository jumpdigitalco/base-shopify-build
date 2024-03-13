/*
    Tabbed Content Module
    Used to show tabbed content, horizontally positioned
*/

/* Example liquid layout
 *
 * <div class="tabbed-module">
 *      <div class="tabbed-title-wrap">
 *          <div class="tabbed-title" data-target="<target>">Title</div>
 *          ...
 *      </div>
 *      <div class="tabbed-content-wrap">
 *          <div class="tabbed-content active" data-target="<target>">{{ content }}</div>
 *          ...
 *      </div>
 * </div>
 *
 */

// Import all dependencies here
import $ from 'jquery';

class TabbedContent {
    constructor({ $el, onTabSelect }) {
        console.log('TabbedContent init');
        this.activeClass = 'active';
        this.$tabs = $el.find('.tabbed-module');

        if (!this.$tabs) return;

        this.$tabTitles = this.$tabs.find('.tabbed-title-wrap .tabbed-title');
        this.onTabSelect = onTabSelect;

        this.setupTabs();
    }

    setupTabs() {
        const { activeClass } = this;
        const self = this;
        let clickHandler = function (e) {
            e.preventDefault();

            const tabChangeEvent = new Event('tabChange');
            const $tabTitle = $(this);
            const $tabTitleWrap = $tabTitle.parents('.tabbed-title-wrap');
            const $tabContentTarget = $tabTitle.data('target');

            console.log('$tabContentTarget', $tabContentTarget);

            if ($tabTitle.hasClass(activeClass)) return;

            $tabTitleWrap.find('.tabbed-title.active').removeClass(activeClass);
            $tabTitle.addClass(activeClass);

            if (self.onTabSelect) {
                self.onTabSelect.call(this);
                return;
            }

            const $tabContentWrap = $tabTitleWrap.siblings(
                '.tabbed-content-wrap'
            );
            $tabContentWrap.children().removeClass(activeClass);
            $tabContentWrap
                .find(`.tabbed-content[data-target="${$tabContentTarget}"]`)
                .addClass(activeClass);

            $tabTitle.get(0).dispatchEvent(tabChangeEvent);
        };

        this.$tabTitles.click(clickHandler);
    }
}

export default TabbedContent;
