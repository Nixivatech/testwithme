namespace TestWithMe.Api.DTOs;

public record CertificateDto(string CertificateCode, string StudentName, string ModuleTitle, DateTimeOffset IssuedAt);

public record CertificateVerificationDto(bool IsValid, CertificateDto? Certificate);
