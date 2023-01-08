class Journal {
    constructor() {
        this.entries = {}
    }

    addEntry (text) {
        let c = ++Journal.count
        let entry = `${c}: ${text}`
        this.entries[c] = entry
        return c
    }
    removeEntry(index) {
        delete this.entries[index]
    }
    toString() {
        return Object.values(this.entries).join('\n')
    }
}
Journal.count = 0

let j = new Journal()
j.addEntry("aweosme")
j.addEntry("good")
console.log(j.toString())
