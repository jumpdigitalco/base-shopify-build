import $ from 'jquery';
import whenDomReady from 'when-dom-ready';
import ViewWebpack from 'Views/view-webpack';

whenDomReady(() => {
    new ViewWebpack({ el: $('.webpack-wrapper') });
});
