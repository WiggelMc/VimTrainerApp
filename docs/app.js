'use strict'

const favicon = document.querySelector("link#favicon")
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)")
const changeFavicon = () => {
    if (favicon != null) {
        if (isDarkMode.matches) {
            favicon.href = "./favicon-dark.png"
        } else {
            favicon.href = "./favicon-light.png"
        }
    }
}
changeFavicon()
isDarkMode.addEventListener?.("change", changeFavicon)


let confirmExit = false
window.addEventListener("beforeunload", (e) => {
    if (confirmExit) {
        e.preventDefault();
        e.returnValue = "";
    }
})

function getFlags() {
    return {
        storagePackets: Object.entries(localStorage)
            .map(([key, data]) =>
                ({
                    key: key,
                    data: data ?? null
                })
            )
    }
}

function registerPorts(app) {
    app.ports?.setShouldConfirmExit?.subscribe((shouldConfirmExit) => {
        confirmExit = shouldConfirmExit
    })

    app.ports?.putSave?.subscribe(({key, data}) => {
        if (data === null) {
            localStorage.removeItem(key)
        } else {
            localStorage.setItem(key, data)
        }
    })
    app.ports?.putLoad?.subscribe((key) => {
        const data = localStorage.getItem(key)
        const packet = {
            key: key,
            data: data
        }
        app.ports?.getLoad?.send(packet)
    })
    window.addEventListener("storage", (event) => {
        const packet = {
            key: event.key,
            data: event.newValue
        }
        app.ports?.getChange?.send(packet)
    })
}
