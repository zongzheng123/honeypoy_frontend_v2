import { makeAutoObservable } from "mobx"

export class ValueState<T> {
    _value!: T
    constructor(args: Partial<ValueState<T>> = {}) {
      Object.assign(this, args);
      makeAutoObservable(this);
    }
  
    get value() {
      return this.getValue ? this.getValue(this._value) : this._value;
    }
    set value(value) {
      this._value = value;
    }
  
    getValue!: (value: T) => T;
  
    setValue(value: T) {
      this._value = value;
    }
  }

export class AsyncState<T> {
    loading = false
    error: Error | null = null
    value: T | null = null
    private _call: (...args: any) => Promise<T>
    constructor(func: (...args: any) => Promise<T>, options?:  {
        loading?: boolean,
    }) {
        this._call = func
        if (options) {
            Object.assign(this, options)
        }
  
        makeAutoObservable(this)
    }
    async call(args?: any) {
        this.setLoading(true)
        try {
            const data = await this._call(args)
            this.setValue(data)
        } catch (error) {
            this.setError(error as Error)
        }
        this.setLoading(false)
        return [this.value, this.error]
    }
    setLoading(loading: boolean) {
        this.loading = loading
    }
    setError(error: Error | null) {
        this.error = error
    }
    setValue(data: T | null) {
        this.value = data
    }
  }
  