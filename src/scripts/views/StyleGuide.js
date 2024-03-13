export default class ViewStyleGuide {
    constructor({ $el }) {
        console.log('init styleguide view !');

        this.$el = $el;
        this.initGrid();

        $(document).on('click', () => {
            this.$el.find('.grid-col').removeClass('show-frame');
        });

        $('.bleeding-ctl').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.toggleClass('full-bleed');
        });
        $('.frame-ctl').click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.$el.find('.grid-system').toggleClass('show-frame');
        });
        $('.grid-col').click(function (e) {
            const $curr = $(e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            this.$el
                .find('.grid-col')
                .not(e.currentTarget)
                .removeClass('show-frame');
            $curr.toggleClass('show-frame');
        });
    }

    initGrid() {
        let html = '';

        this.$grid = this.$el.find('.grid-system');

        // Does this code ever run? I can't find the var gridConfig anywhere in the project
        if (this.$grid.length && gridConfig) {
            gridConfig.forEach((row, index) => {
                html +=
                    '<div class="grid-row" title="row: ' + (index + 1) + '">';
                if (row.col && row.col.length > 0) {
                    for (let col of row) {
                        switch (col.style) {
                            case 'padding':
                                html +=
                                    '<div class="grid-col grid-padding grid-col-' +
                                    col.value +
                                    '"></div>';
                                break;
                            case 'margin':
                                html +=
                                    '<div class="grid-col grid-col-with-margin-' +
                                    col.value +
                                    '"></div>';
                                break;
                            default:
                                html +=
                                    '<div class="grid-col grid-col-' +
                                    col.value +
                                    '"></div>';
                        }
                    }
                } else if (row.col) {
                    var temp =
                        '<div class="grid-col grid-col-with-margin-1"></div>';
                    html += temp.repeat(12);
                }
                html += '</div>';
            });
            this.$grid.append(html);
        }
    }
}
