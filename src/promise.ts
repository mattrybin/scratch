// @ts-nocheck
const STATE = {
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
    PENDING: "pending"
}

class MyPromise {
    #thenCbs = []
    #catchCbs = []
    #state = STATE.PENDING
    #value
    #onSuccessBind = this.#onSuccess.bind(this)
    #onFailBind = this.#onFail.bind(this)

    constructor(cb) {
        try {
            cb(this.#onSuccessBind, this.#onFailBind)
        }
        catch (e) {
            this.#onFail(e)
        }
    }

    #runCallbacks() {
        if (this.#state === STATE.FULFILLED) {
            this.#thenCbs.forEach(callback => {
                callback(this.#value)
            })

            this.#thenCbs = []
        }
        if (this.#state === STATE.REJECTED) {
            this.#catchCbs.forEach(callback => {
                callback(this.#value)
            })
            this.#catchCbs = []
        }
    }

    #onSuccess(value) {
        if (this.#state !== STATE.PENDING) return
        this.#value = value
        this.#state = STATE.FULFILLED
        this.#runCallbacks()
    }

    #onFail(value) {
        if (this.#state !== STATE.PENDING) return
        this.#value = value
        this.#state = STATE.REJECTED
        this.#runCallbacks()
    }

    then(thenCb, catchCb) {
        return new MyPromise((resolve, reject) => {
          this.#thenCbs.push(result => {
            if (thenCb == null) {
              resolve(result)
              return
            }
    
            try {
              resolve(thenCb(result))
            } catch (error) {
              reject(error)
            }
          })
    
          this.#catchCbs.push(result => {
            if (catchCb == null) {
              reject(result)
              return
            }
    
            try {
              resolve(catchCb(result))
            } catch (error) {
              reject(error)
            }
          })
    
          this.#runCallbacks()
        })
      }

    catch(cb) {
        this.then(undefined, cb)
    }

    finally(cb) {

    }
}

// const MyPromise = Promise
const DEFAULT_VALUE = "default"


if (import.meta.vitest) {
    const { describe, expect, it } = import.meta.vitest
    describe("then", () => {
        it("with no chaining", () => {
            return promise().then(v => expect(v).toEqual(DEFAULT_VALUE))
        })

        it("with multiple thens for same promise", () => {
            const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
            const mainPromise = promise()
            const promise1 = mainPromise.then(checkFunc)
            const promise2 = mainPromise.then(checkFunc)
            return Promise.allSettled([promise1, promise2])
        })

        it("with then and catch", () => {
            const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
            const failFunc = v => expect(1).toEqual(2)
            const resolvePromise = promise().then(checkFunc, failFunc)
            const rejectPromise = promise({ fail: true }).then(failFunc, checkFunc)
            return Promise.allSettled([resolvePromise, rejectPromise])
        })

        it("with chaining", () => {
            return promise({ value: 3 })
                .then(v => v * 4)
                .then(v => expect(v).toEqual(12))
        })
    })

    describe("catch", () => {
        it("with no chaining", () => {
            return promise({ fail: true }).catch(v => expect(v).toEqual(DEFAULT_VALUE))
        })

        it("with multiple catches for same promise", () => {
            const checkFunc = v => expect(v).toEqual(DEFAULT_VALUE)
            const mainPromise = promise({ fail: true })
            const promise1 = mainPromise.catch(checkFunc)
            const promise2 = mainPromise.catch(checkFunc)
            return Promise.allSettled([promise1, promise2])
        })

        it("with chaining", () => {
            return promise({ value: 3 })
                .then(v => {
                    throw v * 4
                })
                .catch(v => expect(v).toEqual(12))
        })
    })

    describe("finally", () => {
        it("with no chaining", () => {
            const checkFunc = v => v => expect(v).toBeUndefined()
            const successPromise = promise().finally(checkFunc)
            const failPromise = promise({ fail: true }).finally(checkFunc)
            return Promise.allSettled([successPromise, failPromise])
        })

        it("with multiple finallys for same promise", () => {
            const checkFunc = v => expect(v).toBeUndefined()
            const mainPromise = promise()
            const promise1 = mainPromise.finally(checkFunc)
            const promise2 = mainPromise.finally(checkFunc)
            return Promise.allSettled([promise1, promise2])
        })

        it("with chaining", () => {
            const checkFunc = v => v => expect(v).toBeUndefined()
            const successPromise = promise()
                .then(v => v)
                .finally(checkFunc)
            const failPromise = promise({ fail: true })
                .then(v => v)
                .finally(checkFunc)
            return Promise.allSettled([successPromise, failPromise])
        })
    })

    describe("static methods", () => {
        it("resolve", () => {
            return MyPromise.resolve(DEFAULT_VALUE).then(v =>
                expect(v).toEqual(DEFAULT_VALUE)
            )
        })

        it("reject", () => {
            return MyPromise.reject(DEFAULT_VALUE).catch(v =>
                expect(v).toEqual(DEFAULT_VALUE)
            )
        })

        describe("all", () => {
            it("with success", () => {
                return MyPromise.all([promise({ value: 1 }), promise({ value: 2 })]).then(
                    v => expect(v).toEqual([1, 2])
                )
            })

            it("with fail", () => {
                return MyPromise.all([promise(), promise({ fail: true })]).catch(v =>
                    expect(v).toEqual(DEFAULT_VALUE)
                )
            })
        })

        it("allSettled", () => {
            return MyPromise.allSettled([promise(), promise({ fail: true })]).then(v =>
                expect(v).toEqual([
                    { status: "fulfilled", value: DEFAULT_VALUE },
                    { status: "rejected", reason: DEFAULT_VALUE },
                ])
            )
        })

        describe("race", () => {
            it("with success", () => {
                return MyPromise.race([
                    promise({ value: 1 }),
                    promise({ value: 2 }),
                ]).then(v => expect(v).toEqual(1))
            })

            it("with fail", () => {
                return MyPromise.race([
                    promise({ fail: true, value: 1 }),
                    promise({ fail: true, value: 2 }),
                ]).catch(v => expect(v).toEqual(1))
            })
        })

        describe("any", () => {
            it("with success", () => {
                return MyPromise.any([promise({ value: 1 }), promise({ value: 2 })]).then(
                    v => expect(v).toEqual(1)
                )
            })

            it("with fail", () => {
                return MyPromise.any([
                    promise({ fail: true, value: 1 }),
                    promise({ value: 2 }),
                ]).catch(e => expect(e.errors).toEqual([1, 2]))
            })
        })
    })

    function promise({ value = DEFAULT_VALUE, fail = false } = {}) {
        return new MyPromise((resolve, reject) => {
            fail ? reject(value) : resolve(value)
        })
    }
}