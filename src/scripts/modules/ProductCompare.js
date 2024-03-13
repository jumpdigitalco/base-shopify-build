// Import all dependencies here
import $ from 'jquery';

let GridTemp = require('Templates/template-oneProductCompareGrid.html');
let CompareAllTemp = require('Templates/template-oneProductCompareAll.html');

const storageName = 'comparing_products';
const maxCompareNum = 4;
const specs = [
    {
        spec: 'name',
        label: 'name',
    },
    {
        spec: 'price',
        label: 'price',
    },
    {
        spec: 'type',
        label: 'type',
    },
    {
        spec: 'vendor',
        label: 'vendor',
    },
    {
        spec: 'weight',
        label: 'weight',
    },
];
export default class ProductCompare {
    constructor({ $el }) {
        // Status
        this.$el = $el;
        this.adding = false;
        this.compareAllEngage = false;
        this.canCompareAll = false;
        this.canRemoveAll = false;
        this.canAddItem = true;

        this.$compareModal = this.$el.find('#ProductCompareDrawer');
        this.$compareAddingOverlay = this.$el.find(
            '#product-compare-adding-overlay'
        );
        this.$compareModalTrigger = this.$el.find('.product-compare-trigger');

        if (this.$compareModal.length) {
            console.log('init product compare');
            this.$compareGrid = this.$compareModal.find('.compare-grid');
            this.$compareAllWrapper = this.$compareModal.find(
                '.compare-all-wrapper'
            );
            this.$controls = this.$compareModal.find('.controls');
            this.statusUpdate();
            this.initModal();
        }

        $('.product-compare.add-ctl:not(.disabled)').click(this.addItem);
        $('#ProductCompareDrawer .remove-all:not(.disabled)').click(
            this.removeItem
        );
        $('#ProductCompareDrawer .remove').click(this.removeItem);
        $('#ProductCompareDrawer .compare-all:not(.disabled)').click(
            this.compareAll
        );
        $('#ProductCompareDrawer .compare-print:not(.disabled)').click(
            this.comparePrint
        );
    }

    async initModal() {
        this.renderModalGrid();

        const { default: OneDrawer } = await import('Modules/OneDrawer');

        this.compareModalDrawer = new OneDrawer({
            dontCloseWhenClickOutside: true,
            dontShowOverlay: true,
            drawerElem: '#' + this.$compareModal.attr('id'),
            triggerEvent: 'click',
            triggerElem: '.product-compare-trigger',
            openCallback: () => {
                this.$compareModalTrigger.addClass('disabled');
            },
            closeCallback: () => {
                this.$compareModalTrigger.removeClass('disabled');
            },
        });
    }

    compareAll() {
        if (!this.compareAllEngage) {
            // open
            this.renderCompareAllGrid();
            this.compareAllOpen();
        } else {
            // close
            this.compareAllClose();
        }

        this.statusUpdate();
    }

    compareAllOpen() {
        this.compareAllEngage = true;
        this.$compareModal.addClass('compare-all-engage');
    }

    compareAllClose() {
        this.compareAllEngage = false;
        this.$compareModal.removeClass('compare-all-engage');
    }

    addItem(e) {
        if (this.adding) {
            return false;
        } else {
            this.adding = true;
            this.$compareAddingOverlay.addClass('adding');
        }

        const $curr = $(e.currentTarget);
        const $currItem = $curr.parents('.item');
        const url = $currItem.find('a').attr('href') + '?view=json';

        $.ajax({
            async: true,
            type: 'GET',
            url,
            cache: true,
            error: function (err) {
                console.log(err);
            },
            success: (data) => {
                data = JSON.parse(data);
                this.updateCookie(data);
                this.renderModalGrid();

                this.adding = false;
                this.$compareAddingOverlay.removeClass('adding');

                if (!this.compareModalDrawer.drawerOpened) {
                    this.open();
                }
            },
        });
    }

    removeItem(e) {
        const $curr = $(e.currentTarget);

        if ($curr.hasClass('remove-all')) {
            // remove all
            this.updateCookie({}, true);
            this.renderModalGrid();
        } else if ($curr.parents('.item').data('id')) {
            // remove single item
            var id = $curr.parents('.item').data('id');
            this.updateCookie({ id }, true);
            this.renderModalGrid();
        }
    }

    comparePrint(e) {
        const title = 'Compare Product';
        const mywindow = window.open('', 'PRINT', 'height=400,width=600');

        const styleSheets = $('link[type="text/css"]');
        const styleSheetsHtml = '';
        for (let link of styleSheets) {
            styleSheetsHtml += `<link href="${link.href}" rel="stylesheet" type="text/css" media="all">`;
        }

        const printMeta = `
            <html>
                <head>
                    <title>${title}</title>
                    ${styleSheetsHtml}
                </head>
                <body onload="window.print(); window.close();">
                    <h1>${title}</h1>
                    <div id="ProductCompareDrawer" class="print" style="height: 100%;">
                        document.getElementById("ProductCompareDrawer").innerHTML;
                    </div>
        `;
        mywindow.document.write(printMeta);

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/

        return true;
    }

    statusUpdate() {
        // Get data update
        let data = this.updateCookie();

        if (!data || data.length < 1) {
            console.log('Cannot compare, remove, can add');
            this.canCompareAll = false;
            this.canRemoveAll = false;
            this.canAddItem = true;

            this.$controls
                .find('.compare-all span')
                .text(this.$controls.find('.compare-all span').data('disable'));
            this.$controls
                .find('.compare-all,.remove-all')
                .addClass('disabled');
        } else if (data.length == 1) {
            console.log('Cannot compare, can remove and add');
            this.canCompareAll = false;
            this.canRemoveAll = true;
            this.canAddItem = true;

            this.$controls
                .find('.compare-all span')
                .text(this.$controls.find('.compare-all span').data('disable'));
            this.$controls.find('.compare-all').addClass('disabled');
            this.$controls.find('.remove-all').removeClass('disabled');
        } else if (data.length < maxCompareNum) {
            console.log('Can compare, remove and add');
            this.canCompareAll = true;
            this.canRemoveAll = true;
            this.canAddItem = true;

            if (this.compareAllEngage) {
                this.$controls
                    .find('.compare-all span')
                    .text(
                        this.$controls.find('.compare-all span').data('close')
                    );
            } else {
                this.$controls
                    .find('.compare-all span')
                    .text(
                        this.$controls.find('.compare-all span').data('enable')
                    );
            }

            this.$controls
                .find('.compare-all,.remove-all')
                .removeClass('disabled');
        } else {
            console.log('Cannot add, can compare and remove');
            this.canCompareAll = true;
            this.canRemoveAll = true;
            this.canAddItem = false;

            if (this.compareAllEngage) {
                this.$controls
                    .find('.compare-all span')
                    .text(
                        this.$controls.find('.compare-all span').data('close')
                    );
            } else {
                this.$controls
                    .find('.compare-all span')
                    .text(
                        this.$controls.find('.compare-all span').data('enable')
                    );
            }

            this.$controls
                .find('.compare-all,.remove-all')
                .removeClass('disabled');
        }
    }

    renderModalGrid() {
        // Get data update
        const data = this.updateCookie({});
        const content = this.buildTemplate(
            {
                productdata: data,
                maxCompareNum: maxCompareNum,
            },
            'grid'
        );

        this.$compareGrid.html(content);

        if (this.compareAllEngage) {
            // also update compare all if engaged.
            this.renderCompareAllGrid();
        } else {
            this.statusUpdate();
        }
    }

    renderCompareAllGrid() {
        // Get data update
        const data = this.updateCookie({});

        if (!data || data.length == 0) {
            this.compareAllClose();
        }

        const content = this.buildTemplate(
            {
                specs,
                productdata: data,
                maxCompareNum: maxCompareNum,
            },
            'compare-all'
        );

        this.$compareAllWrapper.html(content);

        this.statusUpdate();
    }

    updateCookie(data, remove) {
        const storageData = localStorage.getItem(storageName)
            ? localStorage.getItem(storageName)
            : false;

        if (!data || $.isEmptyObject(data)) {
            // If no data given, read from cookie
            if (storageData && JSON.parse(storageData)) {
                if (remove) {
                    // Remove all
                    localStorage.setItem(storageName, JSON.stringify([]));
                }

                return JSON.parse(storageData);
            } else {
                return [];
            }
        } else {
            // Read from cookie
            let newData = [];
            if (storageData && JSON.parse(storageData)) {
                newData = JSON.parse(storageData); // expecting an array
            }

            // Update cookie
            if (storageData && storageData.indexOf(data.id) >= 0) {
                // already in your list
                if (remove) {
                    // Remove one from the list
                    const results = $.grep(
                        newData,
                        function (item, i) {
                            return item.id == data.id;
                        },
                        true
                    );
                    newData = results;
                    localStorage.setItem(storageName, JSON.stringify(newData));
                } else {
                    alert(`Item ${data.name} already in your list!`);
                }
            } else if (newData.length < maxCompareNum && !remove) {
                // add new product to compare
                newData.push(data);
                localStorage.setItem(storageName, JSON.stringify(newData));
            } else if (!remove) {
                // max number reach
                alert(`You are reaching the max number to compare`);
            }

            return newData;
        }
    }

    open() {
        this.compareModalDrawer.openDrawer();
    }

    close() {
        this.compareModalDrawer.closeDrawer();
    }

    async buildTemplate(content, type) {
        let typeTemplate;

        switch (type) {
            case '':
                break;
            case 'compare-all':
                typeTemplate = CompareAllTemp;
                break;
            case 'grid':
                typeTemplate = GridTemp;
                break;
        }

        const { default: underscore } = await import('underscore');

        return typeTemplate({
            _: underscore,
            content: content,
        });
    }
}
