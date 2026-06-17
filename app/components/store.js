import { proxy } from 'valtio'

export const store = proxy({
    open: false,
})