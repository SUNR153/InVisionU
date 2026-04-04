from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    rate = '3/hour'
    scope = 'register'


class ScoringRateThrottle(UserRateThrottle):
    rate = '12/hour'
    scope = 'scoring'


class AdminRateThrottle(UserRateThrottle):
    rate = '60/min'
    scope = 'admin'