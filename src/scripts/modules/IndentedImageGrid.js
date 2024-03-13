import $ from 'jquery';

export default function ($content) {
    const $imageGrid = $content.find('.indented-grid-image-module');
    const activeClass = 'active';
    const imageBlocksModule = '.image-blocks-module';

    $imageGrid.on('click', `${imageBlocksModule} .icon`, function () {
        $(this).parents('.image-block').toggleClass(activeClass);
    });
}
