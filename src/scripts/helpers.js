/**
 * Debounce.
 *
 * Wait a specified (or default if not given) amount of time before continuin code execution
 *
 */
export class Debounce {
    /**
     * @type {Number} Amount of time to wait before continuing execution
     */
    #timeout = 500;
    /**
     * @type {TimeoutID} setTimeout identifer used to clear previous iteration of timeout
     */
    #debounce;

    /**
     * constructor.
     *
     * @param {Number} timeout - Used to override instance default
     */
    constructor(timeout) {
        if (timeout) this.#timeout = timeout;
    }

    /**
     * waitForTimeout.
     *
     * Asynchronous code used to halt code execution
     * Called in an async function that will be called multiple times (an Event for example)
     *
     * usage:
     *      await debounce.waitForTimeout();
     */
    async waitForTimeout() {
        clearTimeout(this.#debounce);
        return new Promise((resolve) => {
            this.#debounce = setTimeout(resolve, this.#timeout);
        });
    }
}

export const validResponse = (res) => res.status >= 200 && res.status < 300;

export const findWithIndex = (arr, predicate) => {
    return [arr.find(predicate), arr.findIndex(predicate)];
};

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const setCookie = (
    name,
    value,
    days = 1,
    hours = 0,
    mins = 0,
    // path = '/',
    domain = '.maaji.co'
) => {
    let cookie = `${name}=${value};`;
    const expiry = new Date();

    const _days = days * 24 * 60 * 60 * 1000;
    const _hours = hours * 60 * 60 * 1000;
    const _mins = mins * 60 * 1000;

    expiry.setTime(expiry.getTime() + (_days + _hours + _mins));

    cookie += `expires=${expiry.toGMTString()};domain=${domain};`;

    document.cookie = cookie;
};
