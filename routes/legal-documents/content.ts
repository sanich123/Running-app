import { LANGUAGES } from '@const/enums';

export const LEGAL_OPERATOR = {
  name: 'Воронин Александр Олегович',
  statusRussian:
    'физическое лицо, применяющее специальный налоговый режим «Налог на профессиональный доход» (самозанятый)',
  statusEnglish: 'individual applying the Russian special tax regime for professional income (self-employed)',
  countryRussian: 'Российская Федерация',
  countryEnglish: 'Russian Federation',
  inn: '343803304189',
  addressRussian: 'Российская Федерация, г. Москва, ул. Айвазовского, д. 6, к. 1',
  addressEnglish: 'Russian Federation, Moscow, 6 Ayvazovskogo St., Building 1',
  email: 'aovoronin.piano@gmail.com',
} as const;

export const LEGAL_DOCUMENT_VERSION = {
  russian: '19 сентября 2026 г. Версия 1.3',
  english: 'September 19, 2026. Version 1.3',
} as const;

export type LegalDocumentId = 'privacy' | 'consents' | 'agreement' | 'locationConsent' | 'accountDeletion';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro: string[];
  sections: LegalSection[];
  footer?: string;
}

const RUSSIAN_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Политика в отношении обработки персональных данных',
    intro: [
      'Политика описывает обработку персональных данных в приложении Runich: состав данных, цели, сроки хранения и права пользователя.',
    ],
    sections: [
      {
        heading: '1. Оператор',
        paragraphs: [
          `Оператор: ${LEGAL_OPERATOR.name}, адрес: ${LEGAL_OPERATOR.addressRussian}, ИНН ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}. Runich предоставляет функции авторизации, записи тренировок, маршрутов, статистики, профиля и общения пользователей.`,
        ],
      },
      {
        heading: '2. Какие данные обрабатываются',
        paragraphs: ['Объем данных зависит от выбранных функций:'],
        bullets: [
          'аккаунт: внутренний идентификатор, email, подтверждение email и способ авторизации;',
          'OAuth: email и поля базового профиля, полученные от VK ID или Яндекс ID, — имя, фамилия, город и фото, если они предоставлены. Идентификатор OAuth используется для текущей авторизации и сопоставления аккаунта.',
          'профиль: имя, фамилия, город, пол, дата рождения, вид спорта, описание, фото и вес. Все поля являются необязательными и указываются по желанию пользователя;',
          'тренировки и маршруты: вид спорта, дата, дистанция, длительность, темп/скорость, шаги, описание, видимость, фото/видео, временные точки, координаты, высота и другие параметры, переданные устройством;',
          'технические данные: идентификатор сессии и устройства, модель, платформа, версии ОС и приложения, user-agent, IP-адрес, журналы ошибок и геопозиция сессии, если она передана для авторизации или восстановления состояния.',
        ],
      },
      {
        heading: '3. Цели обработки',
        paragraphs: [
          'Данные нужны для регистрации, входа по email, VK ID или Яндекс ID, восстановления доступа и работы функций Runich: записи тренировок, маршрутов, статистики, профиля и пользовательского контента.',
          'Геолокация используется только для записи активной тренировки; вес заполняется добровольно и не нужен для регистрации.',
          'Технические данные используются для безопасности, предотвращения злоупотреблений, устранения ошибок, поддержки и исполнения требований закона.',
        ],
      },
      {
        heading: '4. OAuth и email',
        paragraphs: [
          'При авторизации через VK ID или Яндекс ID используются email и поля базового профиля для создания или поиска аккаунта и его заполнения. Пароли и OAuth-токены провайдеров не сохраняются в профиле и не используются для иных целей. Регистрация по email доступна только с адресом российского почтового оператора в доменной зоне .ru или .рф; адреса с иностранными доменными именами для регистрации не принимаются.',
        ],
      },
      {
        heading: '5. Геолокация',
        paragraphs: [
          'Перед системным запросом Android на предоставление геолокации, приложение показывает согласие на предоставление геолокации. Доступ к геолокации в фоновом режиме используется только для продолжения записи при заблокированном экране или свернутом приложении и прекращается после остановки тренировки.',
          'Пользователь может отказаться или отозвать системное разрешение. Завершенные маршруты и координаты хранятся до удаления аккаунта; временные данные незавершенной тренировки удаляются после завершения, отмены или сброса записи.',
        ],
      },
      {
        heading: '6. Пользовательский контент',
        paragraphs: [
          'Фотографии, видео, описания, комментарии и другие материалы показываются в выбранном пользователем объеме; пользователь должен иметь права на их публикацию.',
        ],
      },
      {
        heading: '7. Обработка, хранение и удаление',
        paragraphs: [
          'Оператор выполняет сбор, запись, систематизацию, хранение, уточнение, извлечение, использование, передачу подрядчикам, обезличивание, блокирование, удаление и уничтожение только в заявленных целях. Основные серверы приложения и базы данных Runich в рабочей среде размещаются в инфраструктуре Timeweb на территории Российской Федерации. Файлы и медиаматериалы хранятся в S3-совместимом хранилище Timeweb.',
          'Если иное не указано в документе, данные аккаунта, профиля, тренировок, маршрутов, обращений и технические данные хранятся до удаления пользователем аккаунта. После подтверждения удаления аккаунта данные удаляются.',
        ],
      },
      {
        heading: '8. Подрядчики и передача',
        paragraphs: [
          `Для работы Runich могут привлекаться VK ID и Яндекс ID, почтовый провайдер, провайдеры API, базы данных, файлов и резервных копий, карт и CDN. Каждый получает только необходимый объем данных. По вопросам обработки данных, удаления аккаунта, доступа, исправления или отзыва согласия можно обратиться на ${LEGAL_OPERATOR.email}. Государственным органам данные передаются только по закону.`,
        ],
      },
    ],
  },
  consents: {
    title: 'Согласие на обработку персональных данных',
    intro: [
      `Я, пользователь сервиса Runich, свободно, своей волей и в своем интересе даю ${LEGAL_OPERATOR.name}, адрес: ${LEGAL_OPERATOR.addressRussian}, ИНН ${LEGAL_OPERATOR.inn}, согласие на обработку моих персональных данных.`,
    ],
    sections: [
      {
        heading: '1. Цели обработки',
        paragraphs: [
          'Согласие нужно для регистрации и авторизации, восстановления доступа, ведения профиля, записи тренировок, построения маршрутов, расчета статистики, публикации пользовательского контента и связи с пользователем по вопросам работы сервиса.',
        ],
      },
      {
        heading: '2. Состав данных',
        paragraphs: [
          'В зависимости от выбранных функций могут обрабатываться email, идентификатор аккаунта, данные профиля, сведения о тренировках и маршрутах, координаты во время записи, фотографии, комментарии, данные устройства и технические журналы. Необязательные сведения обрабатываются только если пользователь сам их указал.',
        ],
      },
      {
        heading: '3. Действия и срок',
        paragraphs: [
          'Оператор может собирать, записывать, систематизировать, хранить, уточнять, извлекать, использовать, передавать техническим подрядчикам, обезличивать, блокировать, удалять и уничтожать данные в заявленных целях. Согласие действует до его отзыва или удаления аккаунта, если иной срок не установлен законом.',
        ],
      },
      {
        heading: '4. Отзыв согласия',
        paragraphs: [
          `Согласие можно отозвать, направив обращение на ${LEGAL_OPERATOR.email}. Отзыв может сделать недоступными функции, для которых нужны соответствующие данные; он не влияет на законность обработки, выполненной до отзыва.`,
        ],
      },
    ],
  },
  agreement: {
    title: 'Пользовательское соглашение Runich',
    intro: [
      'Нажимая кнопку регистрации или продолжая использование сервиса после ознакомления с документом, пользователь принимает соглашение.',
    ],
    sections: [
      {
        heading: '1. Сервис и оператор',
        paragraphs: [
          `Сервис предоставляет ${LEGAL_OPERATOR.name}, адрес: ${LEGAL_OPERATOR.addressRussian}, ИНН ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}. Runich предоставляет инструменты авторизации, записи тренировок, маршрутов и статистики, профиля и общения пользователей.`,
        ],
      },
      {
        heading: '2. Аккаунт',
        paragraphs: [
          'Пользователь указывает достоверный email, сохраняет доступ к нему и отвечает за действия в аккаунте. Нельзя создавать аккаунты для обмана, обхода ограничений, выдачи себя за другого человека или доступа к чужим данным. Вход доступен по email и паролю либо через VK ID/Яндекс ID.',
        ],
      },
      {
        heading: '3. Данные, геолокация и тренировки',
        paragraphs: [
          'Обработка данных регулируется отдельной Политикой. Продолжая регистрацию или вход после отображения юридического уведомления со ссылками, пользователь принимает документы в интерфейсе сервиса. Запись маршрута начинается только после отдельного согласия на предоставление геолокации и системного разрешения; отслеживание геолокации в фоновом режиме используется только во время записи тренировки.',
          'Тренировки и координаты хранятся до удаления аккаунта, если пользователь не удалил тренировку раньше или более длительный срок не требуется законом.',
        ],
      },
      {
        heading: '4. Пользовательские материалы',
        paragraphs: [
          'Пользователь сохраняет права на загруженные материалы и разрешает Runich хранить, технически обрабатывать и показывать их в объеме, необходимом для выбранных функций и настроек видимости. Пользователь гарантирует, что публикация не нарушает закон, авторские права, права на изображение и частную жизнь других лиц.',
        ],
      },
      {
        heading: '5. Запрещенное использование',
        paragraphs: ['Запрещается:'],
        bullets: [
          'использовать фиктивные аккаунты, чужие данные, незаконную деятельность, угрозы, преследование, спам или вредоносный код;',
          'нарушать работу инфраструктуры или собирать данные пользователей автоматизированно без разрешения;',
          'публиковать материалы, нарушающие права третьих лиц или применимое право.',
        ],
      },
      {
        heading: '6. Спортивная информация и доступность',
        paragraphs: [
          'Runich не является медицинской организацией и не заменяет врача, тренера или экстренную службу. Показатели носят информационный характер; пользователь самостоятельно оценивает состояние здоровья и безопасность тренировки.',
          'Оператор стремится поддерживать сервис доступным, но не гарантирует бесперебойную работу при сбоях связи, устройств, магазинов приложений, картографических и иных внешних сервисов, технических работах или форс-мажоре.',
        ],
      },
      {
        heading: '7. Ограничение доступа и удаление',
        paragraphs: [
          'Оператор может ограничить доступ при нарушении соглашения, угрозе безопасности или требовании закона. Пользователь может удалить аккаунт в настройках приложения или по инструкции на странице «Удаление аккаунта». Удаление прекращает доступ и удаляет связанные данные с учетом законных исключений.',
        ],
      },
      {
        heading: '8. Изменения и применимое право',
        paragraphs: [
          `Новая редакция публикуется на этой странице. Продолжение использования означает принятие изменений, если закон не требует отдельного согласия. Вопросы и обращения принимаются по адресу ${LEGAL_OPERATOR.email}. Применяется право РФ, если обязательные нормы страны пользователя не устанавливают иное.`,
        ],
      },
    ],
  },

  locationConsent: {
    title: 'Согласие на обработку данных геолокации',
    intro: [
      `Оператор: ${LEGAL_OPERATOR.name}, адрес: ${LEGAL_OPERATOR.addressRussian}, ИНН ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}.`,
    ],
    sections: [
      {
        heading: '1. Цель и состав данных',
        paragraphs: [
          'Я добровольно разрешаю получать и обрабатывать геолокацию устройства для записи, построения и отображения маршрута активной тренировки, расчета расстояния, скорости, темпа и статистики, а также восстановления записи после сбоя. Это могут быть широта, долгота, время, высота, точность, скорость и направление движения, если они переданы устройством.',
        ],
      },
      {
        heading: '2. Период и системное разрешение',
        paragraphs: [
          'Системное разрешение может предоставлять доступ к геолокации в фоне в любое время, но Runich обращается к геолокации в фоне только во время активной тренировки — при заблокированном экране или свернутом приложении. Обращение к геолокации прекращается после остановки тренировки. Завершенные маршруты и координаты хранятся до удаления аккаунта, если не удалены вместе с тренировкой или более длительное хранение не требуется законом.',
          'После этого согласия приложение запрашивает системное разрешение. Без него запись маршрута недоступна или может быть неполной.',
        ],
      },
      {
        heading: '3. Отказ, отзыв и передача',
        paragraphs: [
          'Я могу отказаться, закрыть запрос или отозвать разрешение в настройках устройства. Отзыв не удаляет уже сохраненный маршрут: для удаления нужно удалить тренировку или аккаунт либо обратиться к оператору.',
          'Координаты могут передаваться техническим подрядчикам только для хранения, обработки маршрута, резервного копирования и отображения карты. Государственным органам они передаются только по закону.',
        ],
      },
    ],
  },
  accountDeletion: {
    title: 'Удаление аккаунта и обращения пользователя',
    intro: [
      `Удалить аккаунт можно в приложении Runich или по email оператора: ${LEGAL_OPERATOR.email}. Оператор: ${LEGAL_OPERATOR.name}, адрес: ${LEGAL_OPERATOR.addressRussian}, ИНН ${LEGAL_OPERATOR.inn}.`,
    ],
    sections: [
      {
        heading: '1. Удаление в приложении',
        paragraphs: [
          'Откройте «Настройки», выберите «Удалить аккаунт» и подтвердите действие. Сервер удаляет аккаунт и связанные данные, приложение очищает локальную сессию.',
        ],
      },
      {
        heading: '2. Запрос по email',
        paragraphs: [
          `Если войти невозможно, отправьте письмо с адреса аккаунта на ${LEGAL_OPERATOR.email} с темой «Удаление аккаунта Runich», email аккаунта и просьбой удалить аккаунт и связанные данные. Пароль и коды входа отправлять не нужно; оператор может запросить подтверждение личности или владения email.`,
        ],
      },
      {
        heading: '3. Результат и другие обращения',
        paragraphs: [
          `Удаляются аккаунт, профиль, тренировки, маршруты и координаты, материалы, комментарии, отметки «нравится», связи и активные сессии. По вопросам удаления и другим обращениям можно написать на ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
};

const ENGLISH_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Personal Data Processing Policy',
    intro: [
      'This policy describes Runich personal-data processing: data categories, purposes, retention periods and user rights.',
    ],
    sections: [
      {
        heading: '1. Controller',
        paragraphs: [
          `Controller: ${LEGAL_OPERATOR.name}, address: ${LEGAL_OPERATOR.addressEnglish}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}. Runich provides sign-in, workout and route recording, statistics, profile and user-interaction features.`,
        ],
      },
      {
        heading: '2. Data we process',
        paragraphs: ['Depending on the selected features:'],
        bullets: [
          'account: internal Runich identifier, email, email verification and authentication method;',
          'OAuth: email and basic-profile fields received from VK ID or Yandex ID — name, surname, city and photo when provided. The OAuth identifier is used for current authentication and account matching;',
          'profile: name, surname, city, optional gender, date of birth, sport, bio, photo and optional weight;',
          'workouts and routes: sport, date, distance, duration, pace/speed, steps, description, visibility, photos/videos, timestamps, coordinates, altitude and other parameters supplied by the device;',
          'technical data: session and device identifier, model, platform, OS and app versions, user-agent, IP address, error logs and session location when supplied for authentication or state recovery.',
        ],
      },
      {
        heading: '3. Purposes',
        paragraphs: [
          'Data is needed for registration, sign-in by email, VK ID or Yandex ID, access recovery and Runich features: workout and route recording, statistics, profiles and user content.',
          'Location is used only to record an active workout; weight is voluntary and is not required for registration.',
          'Technical data is used for security, abuse prevention, troubleshooting, support and compliance with legal requirements.',
        ],
      },
      {
        heading: '4. OAuth and email',
        paragraphs: [
          'When you sign in through VK ID or Yandex ID, email and basic-profile fields are used to create or find an account and fill its profile. Provider passwords and OAuth tokens are not stored in the profile or used for unrelated purposes. Email registration is available only with an address from a Russian email provider in the .ru or .рф domain zone; addresses with foreign domain names are not accepted for registration.',
        ],
      },
      {
        heading: '5. Location data',
        paragraphs: [
          'Before the Android system request to grant location access, the app shows location consent. Background location access is used only to continue recording while the screen is locked or the app is minimized and stops when the workout stops.',
          'You may refuse or revoke the system permission. Completed routes and coordinates are kept until you delete the account; temporary data from an unfinished workout is deleted after recording is completed, cancelled or reset.',
        ],
      },
      {
        heading: '6. User content',
        paragraphs: [
          'Photos, videos, descriptions, comments and other materials are displayed to the extent selected by the user; the user must have the rights required to publish them.',
        ],
      },
      {
        heading: '7. Processing, storage and deletion',
        paragraphs: [
          'The controller collects, records, organizes, stores, updates, retrieves, uses, transfers to processors, anonymizes, blocks, deletes and destroys data only for the stated purposes. The main Runich application servers and databases in the production environment are hosted in Timeweb infrastructure in the Russian Federation. Files and media are stored in Timeweb S3-compatible storage.',
          'Unless this document states otherwise, account, profile, workout, route, support-request and technical data are kept until the user deletes the account. After deletion is confirmed, the data is deleted.',
        ],
      },
      {
        heading: '8. Processors and transfers',
        paragraphs: [
          `Runich may use VK ID and Yandex ID, a mail provider, API, database, file and backup, map and CDN providers. Each receives only the amount of data necessary for its task. For questions about processing, account deletion, access, correction or withdrawal of consent, contact ${LEGAL_OPERATOR.email}. Data is disclosed to public authorities only as required by law.`,
        ],
      },
    ],
  },
  consents: {
    title: 'Consent to Personal Data Processing',
    intro: [
      `I, a user of the Runich service, freely, of my own will and in my own interest, give ${LEGAL_OPERATOR.name}, address: ${LEGAL_OPERATOR.addressEnglish}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, my consent to the processing of my personal data.`,
    ],
    sections: [
      {
        heading: '1. Purposes',
        paragraphs: [
          'The consent is needed for registration and sign-in, access recovery, profile management, workout recording, route building, statistics calculation, publication of user content and communication with the user about the service.',
        ],
      },
      {
        heading: '2. Data categories',
        paragraphs: [
          'Depending on the selected features, Runich may process email, account identifier, profile data including optional gender and weight, workout and route information, coordinates during recording, photos, comments, device data and technical logs. Optional information is processed only when the user provides it.',
        ],
      },
      {
        heading: '3. Operations and period',
        paragraphs: [
          'The controller may collect, record, organize, store, update, retrieve, use, transfer to technical processors, anonymize, block, delete and destroy data for the stated purposes. The consent remains valid until it is withdrawn or the account is deleted unless a different period is established by law.',
        ],
      },
      {
        heading: '4. Withdrawal',
        paragraphs: [
          `You may withdraw consent by sending a request to ${LEGAL_OPERATOR.email}. Withdrawal may make features that require the relevant data unavailable; it does not affect the lawfulness of processing carried out before withdrawal.`,
        ],
      },
    ],
  },
  agreement: {
    title: 'Runich User Agreement',
    intro: [
      'By pressing the registration button or continuing to use the service after reviewing this document, the user accepts the Agreement.',
    ],
    sections: [
      {
        heading: '1. Service and operator',
        paragraphs: [
          `The service is provided by ${LEGAL_OPERATOR.name}, address: ${LEGAL_OPERATOR.addressEnglish}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}. Runich provides sign-in, workout and route recording, statistics, profile and user-interaction tools.`,
        ],
      },
      {
        heading: '2. Account',
        paragraphs: [
          'The user provides a valid email, keeps access to it and is responsible for activity in the account. Accounts must not be created for fraud, bypassing restrictions, impersonating another person or accessing someone else’s data. Sign-in is available by email and password or through VK ID/Yandex ID.',
        ],
      },
      {
        heading: '3. Data, location and workouts',
        paragraphs: [
          'Personal-data processing is governed by the separate Policy. Continuing registration or sign-in after the legal notice with links is displayed means that the user accepts the documents in the service interface. Route recording starts only after separate consent to grant location access and the system permission; background location tracking is used only during workout recording.',
          'Workouts and coordinates are kept until the account is deleted unless the user deletes a workout earlier or a longer period is required by law.',
        ],
      },
      {
        heading: '4. User content',
        paragraphs: [
          'The user retains rights to uploaded materials and grants Runich the right to store, technically process and display them to the extent necessary for the selected features and visibility settings. The user guarantees that publication does not violate the law, copyright, image rights or the privacy of other persons.',
        ],
      },
      {
        heading: '5. Prohibited use',
        paragraphs: ['The following is prohibited:'],
        bullets: [
          'using fictitious accounts, other people’s data, unlawful activity, threats, harassment, spam or malicious code;',
          'disrupting the infrastructure or collecting user data by automated means without permission;',
          'publishing materials that violate third-party rights or applicable law.',
        ],
      },
      {
        heading: '6. Sports information and availability',
        paragraphs: [
          'Runich is not a medical organization and does not replace a doctor, coach or emergency service. The metrics are informational; the user independently assesses their health and workout safety.',
          'The operator seeks to keep the service available but does not guarantee uninterrupted operation during failures of communications, devices, app stores, map and other external services, maintenance or force majeure.',
        ],
      },
      {
        heading: '7. Access restriction and deletion',
        paragraphs: [
          'The operator may restrict access in the event of a breach of the Agreement, a security threat or a legal requirement. The user may delete the account in the app settings or using the instructions on the Account Deletion page. Deletion ends access and deletes related data, subject to legal exceptions.',
        ],
      },
      {
        heading: '8. Changes and governing law',
        paragraphs: [
          `A new version is published on this page. Continued use means acceptance of the changes unless the law requires separate consent. Questions and requests are accepted at ${LEGAL_OPERATOR.email}. Russian law applies unless mandatory rules of the user’s country provide otherwise.`,
        ],
      },
    ],
  },

  locationConsent: {
    title: 'Consent to Process Location Data',
    intro: [
      `Controller: ${LEGAL_OPERATOR.name}, address: ${LEGAL_OPERATOR.addressEnglish}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}.`,
    ],
    sections: [
      {
        heading: '1. Purpose and data categories',
        paragraphs: [
          'I voluntarily allow the device location to be received and processed for recording, building and displaying an active workout route, calculating distance, speed, pace and statistics, and recovering a recording after a failure. This may include latitude, longitude, time, altitude, accuracy, speed and direction of movement when supplied by the device.',
        ],
      },
      {
        heading: '2. Period and system permission',
        paragraphs: [
          'The system permission may allow background location access at any time, but Runich accesses location in the background only during an active workout, when the screen is locked or the app is minimized. Location access stops when the workout stops. Completed routes and coordinates are kept until the account is deleted unless they are deleted with the workout or a longer period is required by law.',
          'After this consent, the app requests system permission. Without it, route recording is unavailable or may be incomplete.',
        ],
      },
      {
        heading: '3. Refusal, withdrawal and transfer',
        paragraphs: [
          'I may refuse, close the request or revoke permission in the device settings. Revocation does not delete an already saved route: to delete it, delete the workout or account, or contact the controller.',
          'Coordinates may be transferred to technical processors only for route storage, route processing, backup and map display. They are disclosed to public authorities only as required by law.',
        ],
      },
    ],
  },
  accountDeletion: {
    title: 'Account Deletion and User Requests',
    intro: [
      `The account can be deleted in the Runich app or by emailing the operator at ${LEGAL_OPERATOR.email}. Controller: ${LEGAL_OPERATOR.name}, address: ${LEGAL_OPERATOR.addressEnglish}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}.`,
    ],
    sections: [
      {
        heading: '1. Delete in the app',
        paragraphs: [
          'Open Settings, select Delete account and confirm. The server deletes the account and related data; the app clears the local session.',
        ],
      },
      {
        heading: '2. Request by email',
        paragraphs: [
          `If you cannot sign in, email ${LEGAL_OPERATOR.email} from the account email with the subject “Runich account deletion”, include the account email and ask to delete the account and related data. Do not send a password or sign-in codes; the controller may request confirmation of identity or email ownership.`,
        ],
      },
      {
        heading: '3. Result and other requests',
        paragraphs: [
          `The account, profile, workouts, routes and coordinates, materials, comments, likes, connections and active sessions are deleted. For deletion requests and other requests, contact ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
};

export const LEGAL_DOCUMENTS = {
  [LANGUAGES.russian]: RUSSIAN_DOCUMENTS,
  [LANGUAGES.english]: ENGLISH_DOCUMENTS,
} as const;

export const LEGAL_DOCUMENT_LABELS = {
  [LANGUAGES.russian]: {
    privacy: 'Политика в отношении обработки персональных данных',
    agreement: 'Пользовательское соглашение',
    consents: 'Согласие на обработку персональных данных',
    locationConsent: 'Согласие на обработку данных геолокации',
    accountDeletion: 'Удаление аккаунта',
    legalInformation: 'Юридическая информация',
  },
  [LANGUAGES.english]: {
    privacy: 'Personal Data Processing Policy',
    agreement: 'User Agreement',
    consents: 'Consent to Personal Data Processing',
    locationConsent: 'Location Consent',
    accountDeletion: 'Account Deletion',
    legalInformation: 'Legal Information',
  },
} as const;
