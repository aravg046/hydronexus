// Stand-ins for the few Framer APIs the original code components imported.
export const ControlType: any = new Proxy({}, { get: () => "control" })
export const addPropertyControls = (_component: any, _controls: any) => {}
export const RenderTarget = { canvas: "canvas", preview: "preview", current: () => "preview" }
