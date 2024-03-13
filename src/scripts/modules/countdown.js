export default class CountDown {
    constructor(endDate, onTimerUpdate, leadingZeroes = true) {
        this.endDate =
            typeof startDate === 'string' ? new Date(endDate) : endDate;
        this.timer = null;
        this.leadingZeroes = leadingZeroes;
        this.onTimerUpdate = onTimerUpdate;
    }

    _timeDifference() {
        const now = new Date();
        const difference = Math.abs(this.endDate.getTime() - now.getTime());

        if (difference <= 0) {
            // Timer done
            clearInterval(this.timer);
        } else {
            let seconds = Math.floor(difference / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);

            hours %= 24;
            minutes %= 60;
            seconds %= 60;

            if (this.leadingZeroes) {
                seconds = this._leadingZero(seconds);
                minutes = this._leadingZero(minutes);
                hours = this._leadingZero(hours);
                days = this._leadingZero(days);
            }

            const data_out = {
                seconds,
                minutes,
                hours,
                days,
            };

            return data_out;
        }
    }

    startTimer() {
        if (this.timer) this.stopTimer();

        this.timer = setInterval(() => {
            const data = this._timeDifference();
            this.onTimerUpdate(data);
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }

    _leadingZero(val) {
        return val < 10 ? `0${val}` : `${val}`;
    }
}
