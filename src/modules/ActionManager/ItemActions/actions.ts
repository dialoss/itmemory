import {triggerEvent} from "helpers/events";
import {actionElement, actionElements, clearElements, setUnselected} from "modules/ActionManager/components/helpers";
import {setActionData} from "./config";
import {getSettings} from "./helpers";
import {getLocation} from "../../../hooks/getLocation";
import {childItemsTree, createItemsTree} from "../../ItemList/helpers";
import {getFormData} from "../../ActionForm/helpers/FormData";

function updateRequest(request) {
    if (request.method === 'DELETE') {
        request.id = '';
        request.method = 'POST';
    }
    if (request.method === 'POST') request.method = 'DELETE';
    return request;
}

class HistoryManager {
    history = [];
    current = 0;
    undo() {
        if (this.current < 0) {
            this.current = 0;
        }
        let request = this.history[this.current];
        request = updateRequest(request);
        this.history.length && triggerEvent('itemlist:request', request);
        this.current -= 1;
    }
    redo() {
        if (!this.history.length) return;
        if (this.current >= this.history.length) {
            this.current = this.history.length - 1;
        }
        let request = this.history[this.current];
        request = updateRequest(request);
        triggerEvent('itemlist:request', request);
        this.current += 1;
    }
    clear() {
        this.history = [];
    }

    add(data) {
        this.history.push(data);
    }
}

const manager = new HistoryManager();

window.addEventListener('keydown', e => {
    if (e.ctrlKey) {
        switch (e.code) {
            case 'KeyZ':
                return manager.undo();
            case 'KeyY':
                return manager.redo();
            case 'KeyC':
                return Actions.copy();
            case 'KeyX':
                return Actions.cut();
            case 'KeyV':
                return Actions.action(Actions.paste());
            case 'KeyQ':
                return manager.clear();
        }
    }
    if (e.key === 'Delete') {
        Actions.action(Actions.delete());
    }
    console.log('history',Actions.history)
    console.log('actionel', actionElements)
})

function preparePage(p) {
    if (typeof (p) !== 'object') {
        const location = getLocation();
        return {
            path: location.relativeURL.slice(1, -1),
        }
    }
    return p;
}

export default class Actions {
    static element = null;
    static elements = [];
    static history = [];

    static action(data) {
        Promise.resolve(data).then(resolve => {
            console.log(resolve)
            for (const request of resolve) {
                let sendData = request.data || {};
                if (sendData.type === 'comment') return;

                sendData.page = preparePage(sendData.page);
                if (request.specifyElement && actionElement.type !== 'page') sendData.id = actionElement.id;
                if (request.specifyParent && !('parent' in sendData) && actionElement.type !== 'page') sendData.parent = actionElement.id;

                if (request.method === "POST" && !sendData.parent && !['base', 'page'].includes(sendData.type)) {
                    sendData = {
                        display_pos: actionElement.display_pos,
                        type: 'base',
                        page: sendData.page,
                        items: [structuredClone(sendData)],
                    }
                }
                let url = '/api/items/';
                if (sendData.type === 'page') url = '/api/pages/';
                if (request.method !== 'POST') {
                    if (!actionElement.id) request.method = 'POST';
                    else {
                        let id = sendData.id;
                        if (!id) id = actionElement.id;
                        url += id + '/';
                    }
                }

                if (!sendData.tab && !actionElement.data.tab) sendData.tab = window.currentTab;
                let storeMethod = request.method;
                if ((sendData.parent || sendData.parent_0 || actionElement.parent || actionElement.parent_0) &&
                    (['POST', 'DELETE'].includes(request.method))) storeMethod = 'PATCH';

                if (request.method === 'POST' && request.createTree) sendData = childItemsTree(sendData);

                let sendRequest = {
                    initialRequest: request,
                    data: sendData,
                    url,
                    method: request.method,
                    storeMethod,
                };
                triggerEvent('itemlist:request', sendRequest);
                let prevData = {};
                for (const f in sendData) {
                    prevData[f] = actionElement.data[f] || sendData[f];
                    prevData.page = preparePage(prevData.page);
                }
                !request.skipHistory && manager.add({...sendRequest, data: prevData});
                console.log(manager.history)
            }
        })
    }

    static add(item='') {
        let data = setActionData(item);
        if (!data) {
            let type = item;
            let initialData = {};
            let extraFields = [];
            if (item === 'add') {
                switch (actionElement.data.type) {
                    case "timeline_entry":
                        type = 'base';
                        initialData = {
                            show_date: true,
                        };
                        extraFields = ['url'];
                        break;
                    case "timeline":
                        type = 'timeline_entry';
                        initialData = {
                            show_shadow: false,
                            color: '#73ff00',
                        };
                        break;
                }
            }
            if (type === 'add') return [];
            triggerEvent('element-form', getFormData({initialData, extraFields, method:'POST', element: {data:{type}}}));
            return [];
        }
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data.map(d => ({
            method: 'POST',
            createTree: false,
            specifyParent: true,
            data: {
                type: item,
                display_pos: actionElement.display_pos,
                ...d,
            }}));
    }

    static edit(item='') {
        if (!actionElement.id) return [];
        if (!item) {
            triggerEvent('element-form', getFormData({method:'PATCH', element: actionElement}));
            return [];
        }
        return [{
            method: 'PATCH',
            specifyElement: true,
            data: {
                ...getSettings(item, actionElement.data)
            }
        }];
    }

    static baseAction(type, name) {
        // console.log(Actions.history)
        Actions.history.forEach(hs => hs.element.html.classList.remove(hs.className));
        Actions.history = [];
        let elements = [...actionElements];
        if (!elements.length) elements = [actionElement];
        elements.forEach(el => {
            el.html.classList.add(name);
            Actions.history.push({
                className: name,
                type: type,
                element: el,
            })
        });
        clearElements();
        return [];
    }

    static copy() {
       return Actions.baseAction('copy', 'copied');
    }

    static cut() {
        return Actions.baseAction('cut', 'cutted');
    }

    static paste() {
        let historyData = Actions.history;
        if (!historyData) return [];
        let action = actionElement;

        let actionData = structuredClone(action.data);

        let request = [];
        historyData.forEach(hs => {
            let item = {
                ...hs.element.data,
                display_pos: actionData.display_pos,
                parent: action.id,
            };
            request.push({
                data: item,
            });
            request[request.length - 1].method = 'POST';
            if (hs.type === 'cut') request.push(...Actions.delete([hs.element]));
        });
        historyData.forEach(hs => hs.element.html.classList.remove(hs.className));
        return request;
    }

    static delete(elements=[]) {
        if (!elements.length) elements = [...actionElements];
        const f = el => ({data: structuredClone(el.data), method: 'DELETE', element: el.html});
        let data = elements.map(el => f(el));
        if (!data.length) data = [f(actionElement)];
        if (elements.length) return data;
        clearElements();
        return new Promise((resolve) => {
            triggerEvent('user-prompt', {title: "Подтвердить удаление", button: 'ок', submitCallback: (submit) => {
                if (!!submit) resolve(data);
                else resolve([]);
            }});
        });
    }
}