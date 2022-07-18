// class to implement time intervals operations
class TimeInterval {
    constructor (hour, minute) {
        this.minutes = hour * 60 + minute;
    }
    get minute() {
        return this.minutes % 60;
    }

    get hour() {
        return Math.floor(this.minutes/60);
    }

    sub(timeInterval) {
        let newTime = new TimeInterval(0,0);
        newTime.minutes = this.minutes - timeInterval.minutes;
        return newTime;
    }

    sum(timeInterval) {
        let newTime = new TimeInterval(0,0);
        newTime.minutes = this.minutes + timeInterval.minutes;
        return newTime;
    }

    copy() {
        let copy = new TimeInterval(0,0);
        copy.minutes = this.minutes;
        return copy;
    }

    toString() {
        if (this.minute < 10)
            return "" + this.hour + ":0" + this.minute;
        return "" + this.hour + ":" + this.minute;
    }

    fromString(timeString) {
        if(timeString == null)
            return;
        let split  = timeString.split(":");
        let hour   = parseInt(split[0]);
        let minute = parseInt(split[1]);
        this.minutes = hour * 60 + minute;
    }
}

// define constant intervals, they can be changed in case of time regulations changes
const TNV    = new TimeInterval(0,15);
const PRANZO = new TimeInterval(0,30);
const TEMPO_BASE = new TimeInterval(8,0);

class App {
    constructor () {
        this.entrata       = new TimeInterval(0,0);
        this.uscitaTNV     = new TimeInterval(0,0);
        this.rientroTNV    = new TimeInterval(0,0);
        this.uscitaPranzo  = new TimeInterval(0,0);
        this.rientroPranzo = new TimeInterval(0,0);

        this.tempoDovuto    = TEMPO_BASE.copy()
        this.tempoRimanente = new TimeInterval(0,0);
        this.orarioUscita   = new TimeInterval(0,0);
        this.started        = false;
    }

    setEntrata(entrata_str) {
        this.entrata.fromString(entrata_str);
        this.started = true;
    }

    setUscitaTNV(uscitaTNV_str) {
        this.uscitaTNV.fromString(uscitaTNV_str);
    }

    setRientroTNV(rientroTNV_str) {
        this.rientroTNV.fromString(rientroTNV_str);
    }

    setUscitaPranzo(uscitaPranzo_str) {
        this.uscitaPranzo.fromString(uscitaPranzo_str);
    }

    setRientroPranzo(rientroPranzo_str) {
        this.rientroPranzo.fromString(rientroPranzo_str);
    }

    saveState(localStorage) {
        localStorage.setItem("entrata", this.entrata.toString());
        localStorage.setItem("uscitaTNV", this.uscitaTNV.toString());
        localStorage.setItem("rientroTNV", this.rientroTNV.toString());
        localStorage.setItem("uscitaPranzo", this.uscitaPranzo.toString());
        localStorage.setItem("rientroPranzo", this.rientroPranzo.toString());
        app.run();
        updateUI();
    }

    loadState(localStorage) {
        if(localStorage.getItem("entrata") != null)
            this.setEntrata(localStorage.getItem("entrata"));
        else 
            return;

        if(localStorage.getItem("uscitaTNV") != null)
            this.setUscitaTNV(localStorage.getItem("uscitaTNV"));
        if(localStorage.getItem("rientroTNV") != null)        
            this.setRientroTNV(localStorage.getItem("rientroTNV"));
        if(localStorage.getItem("uscitaPranzo") != null)        
            this.setUscitaPranzo(localStorage.getItem("uscitaPranzo"));
        if(localStorage.getItem("rientroPranzo") != null)        
            this.setRientroPranzo(localStorage.getItem("rientroPranzo"));

        app.run();
        updateUI();
        update();
    }

    resetState(localStorage) {
        localStorage.clear();
        this.entrata       = new TimeInterval(0,0);
        this.uscitaTNV     = new TimeInterval(0,0);
        this.rientroTNV    = new TimeInterval(0,0);
        this.uscitaPranzo  = new TimeInterval(0,0);
        this.rientroPranzo = new TimeInterval(0,0);

        this.tempoDovuto    = TEMPO_BASE.copy()
        this.tempoRimanente = new TimeInterval(0,0);
        this.orarioUscita   = new TimeInterval(0,0);
        app.run();
        updateUI();
        this.started = false;
        
        document.getElementById("tempoDovuto").innerHTML    = "8:00";
        document.getElementById("tempoRimanente").innerHTML = "8:00";
        document.getElementById("orarioUscita").innerHTML   = "16:00";
    }

    // this function computes the remaining time and should be runned each minute or when values are modified
    run() {

        if(!this.started)
            return;

        let now = new Date();
        let ora = new TimeInterval(now.getHours(), now.getMinutes()) 
        this.tempoDovuto = TEMPO_BASE.copy()

        if (this.rientroTNV.sub(this.uscitaTNV).minutes > TNV.minutes)
            this.tempoDovuto = this.tempoDovuto.sum(this.rientroTNV.sub(this.uscitaTNV).sub(TNV));

        if (this.rientroPranzo.sub(this.uscitaPranzo).minutes > PRANZO.minutes)
            this.tempoDovuto = this.tempoDovuto.sum(this.rientroPranzo.sub(this.uscitaPranzo).sub(PRANZO));

        this.tempoRimanente = this.tempoDovuto.sub(ora.sub(this.entrata));

        this.orarioUscita = ora.sum(this.tempoRimanente);
    }

    getTempoRimanente() {
        let tempoRimanente = this.tempoRimanente.toString();

        if(this.tempoRimanente.minutes < 0)
        {
            let temp = this.tempoRimanente.copy()
            temp.minutes = Math.abs(temp.minutes)
            tempoRimanente = "+" + temp.toString();
        }

        return tempoRimanente;
    }

    getTempoDovuto() {
        return this.tempoDovuto.toString();
    }

    getOrarioUscita() {
        return this.orarioUscita.toString();
    }
}

// create the app
let app = new App();

function update() {
    if(!app.started)
        return;

    app.run();
    document.getElementById("tempoDovuto").innerHTML    = app.getTempoDovuto();
    document.getElementById("tempoRimanente").innerHTML = app.getTempoRimanente();
    document.getElementById("orarioUscita").innerHTML   = app.getOrarioUscita();
}

function updateUI() {
    document.getElementById("entrata").value = app.entrata.minutes === 0 ? "" : app.entrata.toString();
    document.getElementById("uscitaTNV").value = app.uscitaTNV.minutes === 0 ? "" : app.uscitaTNV.toString();
    document.getElementById("rientroTNV").value = app.rientroTNV.minutes === 0 ? "" : app.rientroTNV.toString();
    document.getElementById("uscitaPranzo").value = app.uscitaPranzo.minutes === 0 ? "" : app.uscitaPranzo.toString();
    document.getElementById("rientroPranzo").value = app.rientroPranzo.minutes === 0 ? "" : app.rientroPranzo.toString();
}

function impostaEntrata(now) {
    let entrata = "";
    if(now)
        entrata = nowToText();
    else
        entrata = document.getElementById("entrata").value;
    
    app.setEntrata(entrata);
    update();
}

function impostaUscitaTNV(now) {
    let uscitaTNV = "";
    if(now)
        uscitaTNV = nowToText();
    else
        uscitaTNV = document.getElementById("uscitaTNV").value;
    
    app.setUscitaTNV(uscitaTNV);
    update();
}

function impostaRientroTNV(now) {
    let rientroTNV = "";
    if(now)
        rientroTNV = nowToText();
    else
        rientroTNV = document.getElementById("rientroTNV").value;
    
    app.setRientroTNV(rientroTNV);
    update();
}

function impostaUscitaPranzo(now) {
    let uscitaPranzo = "";
    if(now)
        uscitaPranzo = nowToText();
    else
        uscitaPranzo = document.getElementById("uscitaPranzo").value;
     
    app.setUscitaPranzo(uscitaPranzo);
    update();
}

function impostaRientroPranzo(now) {
    let rientroPranzo = "";
    if(now)
        rientroPranzo = nowToText();
    else
        rientroPranzo = document.getElementById("rientroPranzo").value;

    app.setRientroPranzo(rientroPranzo);
    update();
}

function nowToText() {
    let now = new Date();
    return `${now.getHours()}:${now.getMinutes()}`;
}

function repeatEvery(func, interval) {
    let now = new Date();
    let delay = interval - now % interval;
    function start() {
        func();
        setInterval(func, interval);
    }
    setTimeout(start, delay);
}

// this function is runned when each minute change
repeatEvery(() => {
    if(!app.started)
        return;
    app.run();
    update()
}, 1000 * 60);