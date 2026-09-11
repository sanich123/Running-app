import { LANGUAGES } from '@const/enums';

export const LEGAL_OPERATOR = {
  name: 'Воронин Александр Олегович',
  statusRussian:
    'физическое лицо, применяющее специальный налоговый режим «Налог на профессиональный доход» (самозанятый)',
  statusEnglish: 'individual applying the Russian special tax regime for professional income (self-employed)',
  countryRussian: 'Российская Федерация',
  countryEnglish: 'Russian Federation',
  inn: '343803304189',
  address: 'г. Москва, ул. Айвазовского, д. 6, к. 1, кв. 233',
  email: 'aovoronin.piano@gmail.com',
} as const;

export const LEGAL_DOCUMENT_VERSION = {
  russian: '11 сентября 2026 г. Версия 1.0',
  english: 'September 11, 2026. Version 1.0',
} as const;

export type LegalDocumentId = 'privacy' | 'agreement' | 'consents' | 'locationConsent' | 'accountDeletion';

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
      'Политика описывает обработку персональных данных в приложении и веб-версии Runich: состав данных, цели, сроки хранения и права пользователя.',
    ],
    sections: [
      {
        heading: '1. Оператор',
        paragraphs: [
          `Оператор: ${LEGAL_OPERATOR.name}, ИНН ${LEGAL_OPERATOR.inn}, адрес для корреспонденции: ${LEGAL_OPERATOR.address}, email: ${LEGAL_OPERATOR.email}. Runich предоставляет функции авторизации, записи тренировок, маршрутов, статистики, профиля и общения пользователей.`,
        ],
      },
      {
        heading: '2. Какие данные обрабатываются',
        paragraphs: ['Объем данных зависит от выбранных функций:'],
        bullets: [
          'аккаунт: внутренний ID Runich, email, подтверждение email и способ авторизации;',
          'OAuth: email и поля базового профиля, полученные от VK ID или Яндекс ID, — имя, фамилия, город и фото, если они предоставлены. Отдельные поля vkId/yandexId не создаются; идентификатор OAuth используется для текущей авторизации и сопоставления аккаунта.',
          'профиль: имя, фамилия, город, пол, дата рождения, вид спорта, описание, фото и опциональный вес;',
          'тренировки и маршруты: вид спорта, дата, дистанция, длительность, темп/скорость, шаги, описание, видимость, фото/видео, временные точки, координаты, высота и другие параметры, переданные устройством;',
          'технические данные: ID сессии и устройства, модель, платформа, версии ОС и приложения, user-agent, IP-адрес, журналы ошибок и геопозиция сессии, если она передана для авторизации или восстановления состояния.',
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
          'Перед системным запросом Android приложение показывает отдельное согласие на геолокацию. Доступ в фоне используется только для продолжения записи при заблокированном экране или свернутом приложении и прекращается после остановки тренировки.',
          'Пользователь может отказаться или отозвать системное разрешение. Завершенные маршруты и координаты хранятся до удаления аккаунта; временные данные незавершенной тренировки удаляются после завершения, отмены или сброса записи.',
        ],
      },
      {
        heading: '6. Вес и пользовательский контент',
        paragraphs: [
          'Вес сохраняется только если пользователь сам указал его в профиле. Его можно изменить или удалить, очистив поле, либо удалить вместе с аккаунтом. Фотографии, видео, описания, комментарии и другие материалы показываются в выбранном пользователем объеме; пользователь должен иметь права на их публикацию.',
        ],
      },
      {
        heading: '7. Обработка, хранение и удаление',
        paragraphs: [
          'Оператор выполняет сбор, запись, систематизацию, хранение, уточнение, извлечение, использование, передачу подрядчикам, обезличивание, блокирование, удаление и уничтожение только в заявленных целях. Первичная запись и основные операции с данными граждан РФ выполняются в базах данных на территории РФ.',
          'Данные аккаунта, профиля, тренировок и маршрутов хранятся до удаления пользователем аккаунта, если более длительный срок не нужен по закону. Отдельную тренировку можно удалить, когда такая функция доступна. После удаления аккаунта данные удаляются или обезличиваются, но резервные копии и технические журналы могут сохраняться до плановой ротации или необходимого срока безопасности, спора либо исполнения закона.',
        ],
      },
      {
        heading: '8. Подрядчики и передача',
        paragraphs: [
          'Для работы Runich могут привлекаться VK ID и Яндекс ID, почтовый провайдер, провайдеры API, базы данных, файлов и резервных копий, карт и CDN. Каждый получает только необходимый объем данных и обязан защищать его по договору и применимому праву. Государственным органам данные передаются только по закону.',
          'Если подрядчик находится за пределами РФ или возникает трансграничная передача, оператор до ее начала выполняет предусмотренные законом требования и, когда необходимо, уведомляет пользователя или получает отдельное согласие.',
        ],
      },
      {
        heading: '9. Права, безопасность и изменения',
        paragraphs: [
          `Пользователь может запросить доступ, исправление, блокирование, удаление, ограничение обработки, сведения о получателях данных или отозвать согласие, если обработка основана на согласии. Запрос направляется на ${LEGAL_OPERATOR.email} с email, связанным с аккаунтом; оператор вправе подтвердить личность заявителя.`,
          'Оператор применяет правовые, организационные и технические меры защиты. Новая редакция политики публикуется с датой и версией; при изменении целей обработки новое согласие запрашивается, когда это требуется законом.',
        ],
      },
    ],
  },
  agreement: {
    title: 'Пользовательское соглашение Runich',
    intro: [
      'Соглашение регулирует использование приложения и веб-версии Runich. Нажимая кнопку регистрации или продолжая использование сервиса после ознакомления с документом, пользователь принимает соглашение отдельно от согласия на обработку персональных данных.',
    ],
    sections: [
      {
        heading: '1. Сервис и оператор',
        paragraphs: [
          `Сервис предоставляет ${LEGAL_OPERATOR.name}, ИНН ${LEGAL_OPERATOR.inn}, адрес для корреспонденции: ${LEGAL_OPERATOR.address}, email: ${LEGAL_OPERATOR.email}. Runich предоставляет инструменты авторизации, записи тренировок, маршрутов и статистики, профиля и общения пользователей.`,
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
          'Обработка данных регулируется отдельной Политикой. Продолжая регистрацию или вход после отображения юридического уведомления со ссылками, пользователь принимает документы в интерфейсе сервиса. Запись маршрута начинается только после отдельного согласия на геолокацию и системного разрешения; фон используется только во время записи тренировки.',
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
          'Оператор может ограничить доступ при нарушении соглашения, угрозе безопасности или требовании закона. Пользователь может удалить аккаунт в настройках приложения или по инструкции на странице «Удаление аккаунта». Удаление прекращает доступ и запускает удаление связанных данных с учетом законных исключений и ротации резервных копий.',
        ],
      },
      {
        heading: '8. Изменения и применимое право',
        paragraphs: [
          `Новая редакция публикуется на этой странице. Продолжение использования означает принятие изменений, если закон не требует отдельного согласия. Вопросы направляйте на ${LEGAL_OPERATOR.email}. Применяется право РФ, если обязательные нормы страны пользователя не устанавливают иное.`,
        ],
      },
    ],
  },
  consents: {
    title: 'Согласия пользователя',
    intro: [
      'Эта страница содержит отдельные тексты согласия на обработку данных и принятия Пользовательского соглашения. Перед регистрацией и входом Runich показывает уведомление со ссылками на документы.',
      `Оператор: ${LEGAL_OPERATOR.name}, ИНН ${LEGAL_OPERATOR.inn}, ${LEGAL_OPERATOR.address}, ${LEGAL_OPERATOR.email}.`,
    ],
    sections: [
      {
        heading: '1. Согласие на обработку персональных данных',
        paragraphs: [
          'Я даю оператору согласие обрабатывать мои данные для регистрации, авторизации через email, VK ID или Яндекс ID, работы Runich, хранения и отображения тренировок, маршрутов, статистики и профиля, безопасности, поддержки и исполнения закона. Согласие включает данные аккаунта, email, поля базового профиля OAuth-провайдера, профиль, пользовательский контент, тренировки, маршруты, технические данные, сессии и журналы ошибок в необходимом объеме.',
          'Я разрешаю сбор, запись, систематизацию, хранение, уточнение, использование, передачу подрядчикам, обезличивание, блокирование, удаление и уничтожение данных в этих целях. Согласие действует до отзыва или удаления аккаунта, если иной срок не установлен законом; отзыв направляется на email оператора и не отменяет законность обработки до его получения.',
        ],
      },
      {
        heading: '2. Принятие Пользовательского соглашения',
        paragraphs: [
          'Я принимаю Пользовательское соглашение Runich отдельным от согласия на обработку данных действием и обязуюсь его соблюдать.',
        ],
      },
      {
        heading: '3. Вес и подтверждение согласия',
        paragraphs: [
          'Заполняя поле веса, я добровольно предоставляю его для профиля и персональной статистики; поле необязательно и может быть очищено. Перед регистрацией и входом сервис показывает сообщение «Продолжая, вы соглашаетесь с Пользовательским соглашением и Политикой конфиденциальности» с прямыми ссылками. Продолжение после ознакомления выражает принятие документов. Для подтверждения согласия оператор должен сохранять редакцию документа, дату и необходимые технические сведения.',
        ],
      },
    ],
  },
  locationConsent: {
    title: 'Согласие на обработку данных геолокации',
    intro: [
      `Это согласие отдельно от согласия на остальные данные и системного разрешения Android. Оператор: ${LEGAL_OPERATOR.name}, ИНН ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}.`,
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
          'Геолокация используется во время активной тренировки. Фоновый доступ нужен только при заблокированном экране или свернутом приложении и прекращается после остановки тренировки. Завершенные маршруты и координаты хранятся до удаления аккаунта, если не удалены вместе с тренировкой или более длительное хранение не требуется законом.',
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
      `Удалить аккаунт можно в приложении Runich или по email оператора: ${LEGAL_OPERATOR.email}. Оператор: ${LEGAL_OPERATOR.name}, ИНН ${LEGAL_OPERATOR.inn}, адрес для корреспонденции: ${LEGAL_OPERATOR.address}.`,
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
          'Удаляются или обезличиваются аккаунт, профиль, тренировки, маршруты и координаты, материалы, комментарии, отметки «нравится», связи и активные сессии, кроме данных, которые нужно хранить по закону. Резервные копии и технические журналы очищаются по циклу ротации или хранятся ограниченный срок для безопасности, споров или закона.',
          `На ${LEGAL_OPERATOR.email} также можно направить запрос на доступ, исправление, ограничение обработки, отзыв согласия или жалобу.`,
        ],
      },
    ],
  },
};

const ENGLISH_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    intro: [
      'This policy describes Runich personal-data processing: data categories, purposes, retention periods and user rights.',
    ],
    sections: [
      {
        heading: '1. Controller',
        paragraphs: [
          `Controller: ${LEGAL_OPERATOR.name}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, correspondence address: ${LEGAL_OPERATOR.address}, email: ${LEGAL_OPERATOR.email}. Runich provides sign-in, workout and route recording, statistics, profile and user-interaction features.`,
        ],
      },
      {
        heading: '2. Data we process',
        paragraphs: ['Depending on the selected features:'],
        bullets: [
          'account: Runich user ID, email, email verification and authentication method;',
          'OAuth: email and basic-profile fields received from VK ID or Yandex ID — name, surname, city and photo when provided. No separate vkId/yandexId fields are created; the OAuth identifier is used for current authentication and account matching;',
          'profile: name, surname, city, gender, date of birth, sport, bio, photo and optional weight;',
          'workouts and routes: sport, date, distance, duration, pace/speed, steps, description, visibility, photos/videos, timestamps, coordinates, altitude and other device parameters;',
          'technical data: session and device IDs, model, platform, OS and app versions, user-agent, IP address, error logs and session location when sent for authentication or recovery.',
        ],
      },
      {
        heading: '3. Purposes',
        paragraphs: [
          'Data is used for registration, email/VK ID/Yandex ID sign-in, access recovery and Runich features: workouts, routes, statistics, profiles and user content.',
          'Location is used only to record an active workout. Weight is voluntary and not required for registration.',
          'Technical data supports security, abuse prevention, troubleshooting, support and legal compliance.',
        ],
      },
      {
        heading: '4. OAuth and email',
        paragraphs: [
          'VK ID and Yandex ID provide email and basic-profile fields to create or find an account and fill its profile. Provider passwords and OAuth tokens are not stored in the profile or used for unrelated purposes. Email registration is available only with an address from a Russian email provider in the .ru or .рф domain zone; addresses with foreign domain names are not accepted for registration.',
        ],
      },
      {
        heading: '5. Location data',
        paragraphs: [
          'Before the Android system request, Runich shows separate location consent. Background access is used only to continue recording while the screen is locked or the app is minimized and stops when the workout stops.',
          'You may refuse or revoke the system permission. Completed routes and coordinates are kept until you delete the account; temporary unfinished-workout data is removed when recording is completed, cancelled or reset.',
        ],
      },
      {
        heading: '6. Weight and user content',
        paragraphs: [
          'Weight is stored only if you enter it in your profile and can be removed by clearing the field or deleting the account. Photos, videos, descriptions, comments and other content are displayed according to your visibility choice; you must have the rights needed to publish it.',
        ],
      },
      {
        heading: '7. Processing, storage and deletion',
        paragraphs: [
          'Runich collects, records, organizes, stores, updates, retrieves, uses, transfers to processors, anonymizes, restricts, deletes and destroys data only for the stated purposes. Primary recording and main operations with Russian citizens’ data use databases located in the Russian Federation.',
          'Account, profile, workout and route data are kept until you delete the account unless a longer period is required by law. An individual workout may be deleted where available. After deletion, data is deleted or anonymized; backups and technical logs may remain until rotation or for the period needed for security, disputes or legal compliance.',
        ],
      },
      {
        heading: '8. Processors and disclosures',
        paragraphs: [
          'Runich may use VK ID, Yandex ID, mail, API, database, file and backup, map and CDN providers. Each receives only the data needed for its task and must protect it by contract and applicable law. Disclosures to public authorities are made only when legally required.',
          'If a processor is outside Russia or a cross-border transfer occurs, the controller completes the legally required steps before the transfer and gives notice or obtains separate consent where required.',
        ],
      },
      {
        heading: '9. Rights, security and changes',
        paragraphs: [
          `You may request access, correction, blocking, deletion, restriction, information about recipients or withdraw consent where consent is the legal basis. Contact ${LEGAL_OPERATOR.email} from the email connected with your account; identity verification may be requested.`,
          'The controller uses legal, organizational and technical safeguards. New versions are published with a date and version; new consent is obtained when a change of purpose requires it by law.',
        ],
      },
    ],
  },
  agreement: {
    title: 'Runich User Agreement',
    intro: [
      'This Agreement governs the Runich application and web version. By selecting registration or continuing after reviewing the notice and links, you accept it separately from personal-data consent.',
    ],
    sections: [
      {
        heading: '1. Service and controller',
        paragraphs: [
          `The service is provided by ${LEGAL_OPERATOR.name}, Russian tax ID (INN) ${LEGAL_OPERATOR.inn}, correspondence address: ${LEGAL_OPERATOR.address}, email: ${LEGAL_OPERATOR.email}. Runich provides sign-in, workout and route recording, statistics, profile and user-interaction tools.`,
        ],
      },
      {
        heading: '2. Account',
        paragraphs: [
          'Provide a valid email and keep access to it. You are responsible for activity from your account. Do not create fake accounts, impersonate others, bypass restrictions or access other users’ data. Sign-in is available by email and password or VK ID/Yandex ID.',
        ],
      },
      {
        heading: '3. Data, location and workouts',
        paragraphs: [
          'Personal-data processing is governed by the separate Privacy Policy. Continuing registration or sign-in after the legal notice and links are shown means acceptance in the service interface. Route recording starts only after separate location consent and the system permission; background access is used only during recording.',
          'Workouts and coordinates are kept until you delete the account unless you delete a workout earlier or a longer period is required by law.',
        ],
      },
      {
        heading: '4. User content',
        paragraphs: [
          'You retain rights to uploaded content and grant Runich the right to store, technically process and display it as needed for selected features and visibility. You guarantee that publication does not violate law, copyright, image rights or another person’s privacy.',
        ],
      },
      {
        heading: '5. Prohibited use',
        paragraphs: ['You must not:'],
        bullets: [
          'use fake accounts, other people’s data, unlawful activity, threats, harassment, spam or malicious code;',
          'disrupt infrastructure or collect user data automatically without permission;',
          'publish content that violates third-party rights or applicable law.',
        ],
      },
      {
        heading: '6. Fitness information and availability',
        paragraphs: [
          'Runich is not a medical provider and does not replace a doctor, coach or emergency service. Metrics are informational; you assess your health and workout safety yourself.',
          'Runich aims to remain available but does not guarantee uninterrupted service during network, device, app-store, map or other third-party failures, maintenance or force majeure events.',
        ],
      },
      {
        heading: '7. Restriction and deletion',
        paragraphs: [
          'The controller may restrict access for a breach, security risk or legal requirement. You may delete the account in app settings or via the Account Deletion page. Deletion ends access and starts removal of related data, subject to legal exceptions and backup rotation.',
        ],
      },
      {
        heading: '8. Changes and governing law',
        paragraphs: [
          `Updated versions are published on this page. Continued use means acceptance unless separate consent is required. Send questions to ${LEGAL_OPERATOR.email}. Russian law applies unless mandatory rules in the user’s country provide otherwise.`,
        ],
      },
    ],
  },
  consents: {
    title: 'User Consents',
    intro: [
      'This page contains separate consent and User Agreement texts. Before registration and sign-in, Runich shows a notice with links to the documents.',
      `Controller: ${LEGAL_OPERATOR.name}, INN ${LEGAL_OPERATOR.inn}, ${LEGAL_OPERATOR.address}, ${LEGAL_OPERATOR.email}.`,
    ],
    sections: [
      {
        heading: '1. Consent to personal-data processing',
        paragraphs: [
          'I consent to processing for registration, email/VK ID/Yandex ID authentication, Runich features, storage and display of workouts, routes, statistics and profile data, security, support and legal compliance. This includes account data, email, OAuth basic-profile fields, profile data, user content, workouts, routes, technical data, session data and error logs to the extent needed.',
          'I authorize collection, recording, organization, storage, updating, use, transfer to processors, anonymization, restriction, deletion and destruction for these purposes. Consent remains valid until withdrawal or account deletion unless another period is required by law; withdrawal is sent to the controller’s email and does not affect prior lawful processing.',
        ],
      },
      {
        heading: '2. Acceptance of the User Agreement',
        paragraphs: [
          'I accept the Runich User Agreement through an action separate from personal-data consent and agree to follow it.',
        ],
      },
      {
        heading: '3. Weight and consent record',
        paragraphs: [
          'By filling in the weight field, I voluntarily provide it for my profile and personal statistics; the field is optional and can be cleared. Before registration and sign-in, Runich shows “By continuing, you agree to the User Agreement and Privacy Policy” with direct links. Continuing after reviewing the notice expresses acceptance. The controller should retain the document version, date and necessary technical evidence of consent.',
        ],
      },
    ],
  },
  locationConsent: {
    title: 'Location Data Consent',
    intro: [
      `This consent is separate from consent to other data processing and from the Android system permission. Controller: ${LEGAL_OPERATOR.name}, INN ${LEGAL_OPERATOR.inn}, email: ${LEGAL_OPERATOR.email}.`,
    ],
    sections: [
      {
        heading: '1. Purpose and data',
        paragraphs: [
          'I voluntarily consent to receiving and processing device location to record, build and display an active workout route, calculate distance, speed, pace and statistics, and recover a recording after a failure. Data may include latitude, longitude, time, altitude, accuracy, speed and heading when supplied by the device.',
        ],
      },
      {
        heading: '2. Period and system permission',
        paragraphs: [
          'Location is used during an active workout. Background access is needed only when the screen is locked or the app is minimized and stops when the workout stops. Completed routes and coordinates are kept until you delete the account unless deleted with the workout or retained longer as required by law.',
          'After this consent, the app requests the system permission. Without it, route recording is unavailable or may be incomplete.',
        ],
      },
      {
        heading: '3. Refusal, withdrawal and disclosures',
        paragraphs: [
          'I may refuse, close the request or revoke permission in device settings. Revocation does not automatically delete a saved route; delete the workout or account or contact the controller. Coordinates may be sent to technical processors only for route storage, processing, backup and map display; disclosures to public authorities are made only when legally required.',
        ],
      },
    ],
  },
  accountDeletion: {
    title: 'Account Deletion and User Requests',
    intro: [
      `Delete your Runich account in the app or by emailing ${LEGAL_OPERATOR.email}. Controller: ${LEGAL_OPERATOR.name}, INN ${LEGAL_OPERATOR.inn}, correspondence address: ${LEGAL_OPERATOR.address}.`,
    ],
    sections: [
      {
        heading: '1. Delete in the app',
        paragraphs: [
          'Open Settings, select Delete account and confirm. The server deletes the account and related data; the app clears the local session.',
        ],
      },
      {
        heading: '2. Email request',
        paragraphs: [
          `If you cannot sign in, email ${LEGAL_OPERATOR.email} from the account email with the subject “Runich account deletion” and a clear deletion request. Do not send passwords or sign-in codes; identity or email-ownership verification may be requested.`,
        ],
      },
      {
        heading: '3. Result and other requests',
        paragraphs: [
          'The controller deletes or anonymizes the account, profile, workouts, routes and coordinates, content, comments, likes, connections and active sessions except data retained by law. Backups and technical logs are cleared on rotation or kept for a limited period needed for security, disputes or legal compliance.',
          `Email ${LEGAL_OPERATOR.email} for access, correction, restriction, consent withdrawal or complaints.`,
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
    privacy: 'Политика конфиденциальности',
    agreement: 'Пользовательское соглашение',
    consents: 'Согласия пользователя',
    locationConsent: 'Согласие на геолокацию',
    accountDeletion: 'Удаление аккаунта',
    legalInformation: 'Юридическая информация',
  },
  [LANGUAGES.english]: {
    privacy: 'Privacy Policy',
    agreement: 'User Agreement',
    consents: 'User Consents',
    locationConsent: 'Location Consent',
    accountDeletion: 'Account Deletion',
    legalInformation: 'Legal Information',
  },
} as const;
