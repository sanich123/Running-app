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
  russian: '21 октября 2026 г. Версия 1.5',
  english: 'October 21, 2026. Version 1.5',
} as const;

export type LegalDocumentId = 'privacy' | 'consents' | 'agreement' | 'locationConsent' | 'accountDeletion';

interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocument {
  title: string;
  intro: string[];
  sections: LegalSection[];
  footer?: string;
}

const RUSSIAN_OPERATOR_CONTACT = [
  `Оператор: ${LEGAL_OPERATOR.name}`,
  `Адрес: ${LEGAL_OPERATOR.addressRussian}`,
  `ИНН: ${LEGAL_OPERATOR.inn}`,
  `Email: ${LEGAL_OPERATOR.email}`,
];

const ENGLISH_OPERATOR_CONTACT = [
  `Controller: ${LEGAL_OPERATOR.name}`,
  `Address: ${LEGAL_OPERATOR.addressEnglish}`,
  `Russian tax ID (INN): ${LEGAL_OPERATOR.inn}`,
  `Email: ${LEGAL_OPERATOR.email}`,
];

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
          ...RUSSIAN_OPERATOR_CONTACT,
          'Runich предоставляет функции авторизации, записи тренировок, маршрутов, статистики, профиля и общения пользователей.',
        ],
      },
      {
        heading: '2. Какие данные обрабатываются',
        paragraphs: ['Объем данных зависит от выбранных функций:'],
        bullets: [
          'аккаунт: внутренний идентификатор, email, подтверждение email и способ авторизации;',
          'OAuth: email и поля базового профиля, полученные от VK ID или Яндекс ID, — имя, фамилия, город и фото, если они предоставлены. Идентификатор OAuth используется для текущей авторизации и сопоставления аккаунта.',
          'профиль: имя, фамилия, город, пол, дата рождения, вид спорта, описание, фото, вес, рост и возраст. Все поля являются необязательными и указываются по желанию пользователя;',
          'тренировки и маршруты: вид спорта, дата, дистанция, длительность, темп/скорость, шаги, описание, видимость, фото/видео, временные точки, координаты, высота и другие параметры, переданные устройством;',
          'данные здоровья, импортируемые из Apple Health (HealthKit) на iOS или Health Connect на Android: сведения о тренировке, дистанция, шаги и маршрут; Android также может передавать отдельные измерения пульса и активные калории. Подробный состав и обработка описаны в разделе 6;',
          'технические данные: идентификатор сессии и устройства, модель, платформа, версии ОС и приложения, user-agent, IP-адрес, журналы ошибок и геопозиция сессии, если она передана для авторизации или восстановления состояния.',
        ],
      },
      {
        heading: '3. Цели обработки',
        paragraphs: [
          'Данные нужны для регистрации, входа по email, VK ID или Яндекс ID, восстановления доступа и работы функций Runich: записи тренировок, маршрутов, статистики, профиля и пользовательского контента.',
          'Геолокация используется только для записи активной тренировки; вес, рост, возраст и пол заполняются добровольно и могут использоваться для оценки калорийности тренировки, но не нужны для регистрации.',
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
        heading: '6. Данные здоровья из Apple Health и Health Connect',
        paragraphs: [
          'При подключении хранилища здоровья и предоставлении системных разрешений Runich читает данные на устройстве из Apple Health через HealthKit на iOS или из Health Connect на Android. Импорт охватывает тренировки за последние 30 дней. Доступ используется только для чтения: Runich не записывает данные обратно в Apple Health или Health Connect. При включенной автосинхронизации Android проверяет новые записи при открытии или возвращении в приложение, а iOS — при открытии экрана импорта или возвращении на него; при выключенной автосинхронизации пользователь запускает чтение и импорт вручную.',
          'Для каждой импортируемой тренировки могут считываться вид спорта, название (если передано источником), дата и время начала, часовой пояс, длительность, дистанция, количество шагов, идентификатор тренировки в источнике для предотвращения повторного импорта и связанный маршрут. Точки маршрута могут содержать время, широту, долготу, высоту и точность геопозиции; HealthKit также может передавать скорость и направление движения. На Android дополнительно считываются измерения пульса с временем и значением ударов в минуту, а также активные калории в килокалориях. На iOS Runich запрашивает разрешение HealthKit на чтение активной энергии, но текущая версия приложения не считывает и не отправляет это значение; разрешение на чтение пульса HealthKit не запрашивается.',
          'Эти данные нужны, чтобы создать и обновлять импортированную тренировку в аккаунте Runich, показывать маршрут и спортивные показатели, рассчитывать темп и статистику и отображать график пульса, если он доступен. Данные здоровья не используются для рекламы, маркетингового профилирования или продажи.',
          'После импорта данные передаются в API Runich и хранятся в аккаунте пользователя. В производственной среде серверы и база данных Runich размещаются в инфраструктуре Timeweb в Российской Федерации, а файлы маршрутов хранятся в S3-совместимом хранилище Timeweb. Для формирования карты сервер использует картографические ресурсы OpenFreeMap; если внутренняя генерация карты недоступна, сокращенный маршрут может быть передан Mapbox для создания статического изображения.',
          'Импортированная тренировка по умолчанию имеет публичную видимость. Другие пользователи Runich могут видеть ее показатели и маршрут в пределах настроек видимости тренировки и профиля; просмотр пульса разрешен по умолчанию и отключается в настройках приватности профиля. Настройка «Скрыть карту» убирает картографическую подложку, но оставляет линию маршрута. Чтобы ограничить доступ к тренировке и ее маршруту, измените ее видимость на «Подписчики» или «Приватная».',
          'Импортированная копия хранится в Runich до удаления тренировки или аккаунта. Отзыв разрешения в настройках Apple Health или Health Connect прекращает дальнейшее чтение данных. Выключение автосинхронизации останавливает автоматические проверки и отправку, но при сохраненном системном разрешении пользователь может запустить ручной импорт. Эти действия не удаляют ранее импортированные тренировки: их можно удалить в Runich отдельно или вместе с аккаунтом. Исходные записи остаются в Apple Health или Health Connect, пока пользователь сам не удалит их там.',
        ],
      },
      {
        heading: '7. Пользовательский контент',
        paragraphs: [
          'Фотографии, видео, описания, комментарии и другие материалы показываются в выбранном пользователем объеме; пользователь должен иметь права на их публикацию.',
        ],
      },
      {
        heading: '8. Обработка, хранение и удаление',
        paragraphs: [
          'Оператор выполняет сбор, запись, систематизацию, хранение, уточнение, извлечение, использование, передачу подрядчикам, обезличивание, блокирование, удаление и уничтожение только в заявленных целях. Основные серверы приложения и базы данных Runich в рабочей среде размещаются в инфраструктуре Timeweb на территории Российской Федерации. Файлы и медиаматериалы хранятся в S3-совместимом хранилище Timeweb.',
          'Если иное не указано в документе, данные аккаунта, профиля, тренировок, маршрутов, обращений и технические данные хранятся до удаления пользователем аккаунта. После подтверждения удаления аккаунта данные удаляются.',
        ],
      },
      {
        heading: '9. Подрядчики и передача',
        paragraphs: [
          'Для работы Runich могут привлекаться VK ID и Яндекс ID, почтовый провайдер, провайдеры API, базы данных, файлов и резервных копий, карт и CDN. Каждый получает только необходимый объем данных. Государственным органам данные передаются только по закону.',
          `По вопросам обработки данных, удаления аккаунта, доступа, исправления или отзыва согласия можно обратиться по адресу: ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
  consents: {
    title: 'Согласие на обработку персональных данных',
    intro: [
      ...RUSSIAN_OPERATOR_CONTACT,
      'Я, пользователь сервиса Runich, свободно, своей волей и в своем интересе даю указанному оператору согласие на обработку моих персональных данных.',
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
          'В зависимости от выбранных функций могут обрабатываться email, идентификатор аккаунта, данные профиля, включая пол, вес, рост и возраст, сведения о тренировках и маршрутах, координаты во время записи или импорта из Apple Health (HealthKit) и Health Connect, шаги, а на Android также измерения пульса и активные калории, фотографии, комментарии, данные устройства и технические журналы. Необязательные сведения обрабатываются только если пользователь сам их указал или разрешил соответствующий импорт.',
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
          'Согласие можно отозвать, направив обращение оператору. Доступ Runich к данным Apple Health или Health Connect можно прекратить в системных настройках телефона. Автосинхронизацию можно выключить в Runich; после этого автоматические проверки и отправка прекратятся, но при сохраненном системном разрешении ручной импорт останется доступен. Эти действия не удаляют уже импортированные тренировки — их можно удалить в Runich отдельно или вместе с аккаунтом. Отзыв не влияет на законность обработки, выполненной до отзыва.',
          `Email для отзыва согласия: ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
  agreement: {
    title: 'Пользовательское соглашение Runich',
    intro: [
      'Нажимая кнопку регистрации или продолжая использование сервиса после ознакомления с документом, пользователь принимает соглашение.',
      'Перед публикацией или загрузкой пользовательского контента необходимо принять действующую редакцию соглашения, включая правила сообщества.',
    ],
    sections: [
      {
        heading: '1. Сервис и оператор',
        paragraphs: [
          ...RUSSIAN_OPERATOR_CONTACT,
          'Runich предоставляет инструменты авторизации, записи тренировок, маршрутов и статистики, профиля и общения пользователей.',
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
          'Обработка данных регулируется отдельной Политикой. Продолжая регистрацию или вход после отображения юридического уведомления со ссылками, пользователь принимает документы в интерфейсе сервиса. Для оценки калорийности тренировки пользователь может указать в профиле вес, рост, возраст и пол. Запись маршрута начинается только после отдельного согласия на предоставление геолокации и системного разрешения; отслеживание геолокации в фоновом режиме используется только во время записи тренировки.',
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
          'использовать фиктивные аккаунты, чужие данные, выдавать себя за другого человека, заниматься мошенничеством, незаконной деятельностью или распространять вредоносный код;',
          'публиковать угрозы, призывы к насилию, травлю, преследование или дискриминационные оскорбления;',
          'публиковать сексуальные материалы с участием несовершеннолетних, интимные материалы без согласия изображённых лиц или чужие персональные данные без законного основания;',
          'распространять спам или собирать данные пользователей автоматизированно без разрешения;',
          'нарушать работу инфраструктуры;',
          'публиковать материалы, нарушающие права третьих лиц или применимое право.',
        ],
      },
      {
        heading: '6. Жалобы и модерация',
        paragraphs: [
          'Пользователь может пожаловаться на контент или аккаунт через приложение и заблокировать другого пользователя. Runich проверяет жалобы, может фильтровать материалы до публикации, временно скрывать их на время проверки, удалять контент, ограничивать функции аккаунта или приостанавливать доступ. Пользователю сообщается причина ограничения, если уведомление не создаёт угрозу безопасности или не запрещено законом. Решение можно обжаловать через приложение или по адресу поддержки.',
        ],
      },
      {
        heading: '7. Спортивная информация и доступность',
        paragraphs: [
          'Runich не является медицинской организацией и не заменяет врача, тренера или экстренную службу. Показатели носят информационный характер; пользователь самостоятельно оценивает состояние здоровья и безопасность тренировки.',
          'Оператор стремится поддерживать сервис доступным, но не гарантирует бесперебойную работу при сбоях связи, устройств, магазинов приложений, картографических и иных внешних сервисов, технических работах или форс-мажоре.',
        ],
      },
      {
        heading: '8. Ограничение доступа и удаление',
        paragraphs: [
          'Оператор может ограничить доступ при нарушении соглашения, угрозе безопасности или требовании закона. Пользователь может удалить аккаунт в настройках приложения или по инструкции на странице «Удаление аккаунта». Удаление прекращает доступ и удаляет связанные данные с учетом законных исключений.',
        ],
      },
      {
        heading: '9. Изменения и применимое право',
        paragraphs: [
          'Новая редакция публикуется на этой странице. Продолжение использования означает принятие изменений, если закон не требует отдельного согласия.',
          `Вопросы и обращения принимаются по адресу: ${LEGAL_OPERATOR.email}.`,
          'Применяется право РФ, если обязательные нормы страны пользователя не устанавливают иное.',
        ],
      },
    ],
  },

  locationConsent: {
    title: 'Согласие на обработку данных геолокации',
    intro: RUSSIAN_OPERATOR_CONTACT,
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
    intro: ['Удалить аккаунт можно в приложении Runich или направить запрос оператору.', ...RUSSIAN_OPERATOR_CONTACT],
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
          'Если войти невозможно, отправьте письмо с адреса аккаунта с темой «Удаление аккаунта Runich», email аккаунта и просьбой удалить аккаунт и связанные данные. Пароль и коды входа отправлять не нужно; оператор может запросить подтверждение личности или владения email.',
          `Email для запроса: ${LEGAL_OPERATOR.email}.`,
        ],
      },
      {
        heading: '3. Результат и другие обращения',
        paragraphs: [
          'Удаляются аккаунт, профиль, тренировки, маршруты и координаты, материалы, комментарии, отметки «нравится», связи и активные сессии.',
          `По вопросам удаления и другим обращениям можно написать на ${LEGAL_OPERATOR.email}.`,
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
          ...ENGLISH_OPERATOR_CONTACT,
          'Runich provides sign-in, workout and route recording, statistics, profile and user-interaction features.',
        ],
      },
      {
        heading: '2. Data we process',
        paragraphs: ['Depending on the selected features:'],
        bullets: [
          'account: internal Runich identifier, email, email verification and authentication method;',
          'OAuth: email and basic-profile fields received from VK ID or Yandex ID — name, surname, city and photo when provided. The OAuth identifier is used for current authentication and account matching;',
          'profile: name, surname, city, optional gender, date of birth, sport, bio, photo, weight, height and age;',
          'workouts and routes: sport, date, distance, duration, pace/speed, steps, description, visibility, photos/videos, timestamps, coordinates, altitude and other parameters supplied by the device;',
          'health data imported from Apple Health (HealthKit) on iOS or Health Connect on Android: workout details, distance, steps and route; Android may also provide heart-rate samples and active calories. Section 6 describes the exact data and processing;',
          'technical data: session and device identifier, model, platform, OS and app versions, user-agent, IP address, error logs and session location when supplied for authentication or state recovery.',
        ],
      },
      {
        heading: '3. Purposes',
        paragraphs: [
          'Data is needed for registration, sign-in by email, VK ID or Yandex ID, access recovery and Runich features: workout and route recording, statistics, profiles and user content.',
          'Location is used only to record an active workout; weight, height, age and gender are voluntary and may be used to estimate workout calories, but they are not required for registration.',
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
        heading: '6. Health data from Apple Health and Health Connect',
        paragraphs: [
          'When you connect a health store and grant system permissions, Runich reads data on your device from Apple Health through HealthKit on iOS or Health Connect on Android. Import covers workouts from the last 30 days. Access is read-only: Runich does not write data back to Apple Health or Health Connect. When auto-sync is enabled, Android checks for records when the app is opened or returned to, while iOS checks when you open or return to the import screen. When auto-sync is off, you start reading and import manually.',
          'For each imported workout, Runich may read the sport, title if supplied by the source, start date and time, time zone, duration, distance, step count, source workout identifier used to prevent duplicates, and associated route. Route points may contain time, latitude, longitude, altitude and location accuracy; HealthKit may also provide speed and direction of travel. On Android, Runich additionally reads heart-rate samples with their time and beats-per-minute value, and active calories in kilocalories. On iOS, Runich requests HealthKit read permission for active energy, but the current app version does not read or send that value; it does not request HealthKit heart-rate access.',
          'This data is used to create and update an imported workout in your Runich account, show its route and sports metrics, calculate pace and statistics, and display a heart-rate chart when available. Health data is not used for advertising, marketing profiling or sale.',
          'After import, data is sent to the Runich API and stored in your account. In production, Runich servers and database are hosted in Timeweb infrastructure in the Russian Federation, and route files are stored in Timeweb S3-compatible storage. The server uses OpenFreeMap map resources to render maps; if internal map rendering is unavailable, a reduced route may be sent to Mapbox to create a static image.',
          'An imported workout is public by default. Other Runich users may see its metrics and route subject to the workout and profile visibility settings; heart-rate viewing is enabled by default and can be disabled in profile privacy settings. The “Hide map” setting removes the map background but leaves the route line visible. To restrict access to the workout and its route, change its visibility to “Followers” or “Private”.',
          'The imported copy is kept in Runich until you delete the workout or account. Revoking Apple Health or Health Connect permission in your device settings stops further reading. Turning off auto-sync stops automatic checks and transfers, but you can still start a manual import while system permission remains active. These actions do not delete workouts already imported; delete them in Runich individually or with your account. Source records remain in Apple Health or Health Connect unless you delete them there yourself.',
        ],
      },
      {
        heading: '7. User content',
        paragraphs: [
          'Photos, videos, descriptions, comments and other materials are displayed to the extent selected by the user; the user must have the rights required to publish them.',
        ],
      },
      {
        heading: '8. Processing, storage and deletion',
        paragraphs: [
          'The controller collects, records, organizes, stores, updates, retrieves, uses, transfers to processors, anonymizes, blocks, deletes and destroys data only for the stated purposes. The main Runich application servers and databases in the production environment are hosted in Timeweb infrastructure in the Russian Federation. Files and media are stored in Timeweb S3-compatible storage.',
          'Unless this document states otherwise, account, profile, workout, route, support-request and technical data are kept until the user deletes the account. After deletion is confirmed, the data is deleted.',
        ],
      },
      {
        heading: '9. Processors and transfers',
        paragraphs: [
          'Runich may use VK ID and Yandex ID, a mail provider, API, database, file and backup, map and CDN providers. Each receives only the amount of data necessary for its task. Data is disclosed to public authorities only as required by law.',
          `For questions about processing, account deletion, access, correction or withdrawal of consent, contact: ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
  consents: {
    title: 'Consent to Personal Data Processing',
    intro: [
      ...ENGLISH_OPERATOR_CONTACT,
      'I, a user of the Runich service, freely, of my own will and in my own interest, give the above controller my consent to the processing of my personal data.',
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
          'Depending on the selected features, Runich may process email, account identifier, profile data including optional gender, weight, height and age, workout and route information, coordinates during recording or import from Apple Health (HealthKit) and Health Connect, steps, and on Android heart-rate samples and active calories, photos, comments, device data and technical logs. Optional information is processed only when the user provides it or enables the relevant import.',
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
          'You may withdraw consent by sending a request to the controller. You can stop Runich access to Apple Health or Health Connect in your device settings. Turning off auto-sync stops automatic checks and transfers, but manual import remains available while system permission is active. These actions do not delete workouts already imported; delete them in Runich individually or with your account. Withdrawal does not affect the lawfulness of processing carried out before withdrawal.',
          `Email for consent withdrawal: ${LEGAL_OPERATOR.email}.`,
        ],
      },
    ],
  },
  agreement: {
    title: 'Runich User Agreement',
    intro: [
      'By pressing the registration button or continuing to use the service after reviewing this document, the user accepts the Agreement.',
      'Users must accept the current version of this Agreement, including the Community Rules, before publishing or uploading user content.',
    ],
    sections: [
      {
        heading: '1. Service and operator',
        paragraphs: [
          ...ENGLISH_OPERATOR_CONTACT,
          'Runich provides sign-in, workout and route recording, statistics, profile and user-interaction tools.',
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
          'Personal-data processing is governed by the separate Policy. Continuing registration or sign-in after the legal notice with links is displayed means that the user accepts the documents in the service interface. To estimate workout calories, the user may provide weight, height, age and gender in the profile. Route recording starts only after separate consent to grant location access and the system permission; background location tracking is used only during workout recording.',
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
          'using fictitious accounts or other people’s data, impersonating another person, committing fraud or unlawful activity, or distributing malicious code;',
          'posting threats, calls for violence, bullying, harassment or discriminatory abuse;',
          'posting sexual content involving minors, intimate content without the depicted person’s consent, or another person’s private information without a lawful basis;',
          'distributing spam or collecting user data by automated means without permission;',
          'disrupting the infrastructure;',
          'publishing materials that violate third-party rights or applicable law.',
        ],
      },
      {
        heading: '6. Reports and moderation',
        paragraphs: [
          'Users can report content or an account in the app and block another user. Runich reviews reports and may filter content before publication, temporarily hide it while it is reviewed, remove content, restrict account features or suspend access. We will tell the user why a restriction was applied unless notice could create a safety risk or is prohibited by law. Users can appeal a decision through the app or by contacting support.',
        ],
      },
      {
        heading: '7. Sports information and availability',
        paragraphs: [
          'Runich is not a medical organization and does not replace a doctor, coach or emergency service. The metrics are informational; the user independently assesses their health and workout safety.',
          'The operator seeks to keep the service available but does not guarantee uninterrupted operation during failures of communications, devices, app stores, map and other external services, maintenance or force majeure.',
        ],
      },
      {
        heading: '8. Access restriction and deletion',
        paragraphs: [
          'The operator may restrict access in the event of a breach of the Agreement, a security threat or a legal requirement. The user may delete the account in the app settings or using the instructions on the Account Deletion page. Deletion ends access and deletes related data, subject to legal exceptions.',
        ],
      },
      {
        heading: '9. Changes and governing law',
        paragraphs: [
          'A new version is published on this page. Continued use means acceptance of the changes unless the law requires separate consent.',
          `Questions and requests are accepted at: ${LEGAL_OPERATOR.email}.`,
          'Russian law applies unless mandatory rules of the user’s country provide otherwise.',
        ],
      },
    ],
  },

  locationConsent: {
    title: 'Consent to Process Location Data',
    intro: ENGLISH_OPERATOR_CONTACT,
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
      'The account can be deleted in the Runich app or by sending a request to the controller.',
      ...ENGLISH_OPERATOR_CONTACT,
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
          'If you cannot sign in, send a message from the account email with the subject “Runich account deletion”, include the account email and ask to delete the account and related data. Do not send a password or sign-in codes; the controller may request confirmation of identity or email ownership.',
          `Email for the request: ${LEGAL_OPERATOR.email}.`,
        ],
      },
      {
        heading: '3. Result and other requests',
        paragraphs: [
          'The account, profile, workouts, routes and coordinates, materials, comments, likes, connections and active sessions are deleted.',
          `For deletion requests and other requests, contact ${LEGAL_OPERATOR.email}.`,
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
