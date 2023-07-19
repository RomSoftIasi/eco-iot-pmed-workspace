export default class NotificationMapper {
    static notificationTypes = {
        ECONSENT_ADD: {
            name: 'add-econsent',
            icon: 'themes/clinical-site-theme/images/document_black.png',
            page: 'econsent',
            title: 'NEW ECONSENT FOR TRIAL',
            color: '#A7121C'
        },
        TRIAL_ADD: {
            name: 'add-trial',
            icon: 'themes/clinical-site-theme/images/hospital_black.png',
            page: 'trial',
            title: 'NEW TRIAL',
            color: '#A7121C'
        },
        TRIAL_UPDATE: {
            name: 'update-trial',
            icon: 'themes/clinical-site-theme/images/hospital_black.png',
            page: 'trial',
            title: 'NEW UPDATE FOR TRIAL',
            color: '#00345B'
        },
        ECONSENT_UPDATE: {
            name: 'update-econsent',
            icon: 'themes/clinical-site-theme/images/document_black.png',
            page: 'econsent',
            title: 'NEW ECONSENT UPDATE',
            color: '#00345B'
        },
        TRIAL_DELETE: {
            name: 'delete-trial',
            icon: 'themes/clinical-site-theme/images/hospital_black.png',
            page: 'trial',
            title: 'NEW UPDATE FOR TRIAL',
            color: '#A7121C'
        },
    }

    static getType = (notificationType) => {
        if (!(typeof notificationType === 'string')) {
            return undefined;
        }
        let notification = Object.keys(this.notificationTypes)
            .find(key => this.notificationTypes[key].name.toLowerCase() === notificationType.toLowerCase());
        if (!notification) {
            return undefined;
        }
        return this.notificationTypes[notification];
    }


    static map(notification) {
        let notType = this.getType(notification.operation);
        notification.title = notType.title;
        notification.color = notType.color;
        notification.page = notType.page;
        return notification;
    }
}
