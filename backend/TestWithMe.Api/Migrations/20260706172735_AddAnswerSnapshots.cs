using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestWithMe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAnswerSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "correct_answer",
                table: "quiz_answer_details",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "question_text",
                table: "quiz_answer_details",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "correct_answer",
                table: "quiz_answer_details");

            migrationBuilder.DropColumn(
                name: "question_text",
                table: "quiz_answer_details");
        }
    }
}
