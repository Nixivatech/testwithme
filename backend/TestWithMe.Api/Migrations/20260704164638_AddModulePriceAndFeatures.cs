using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestWithMe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddModulePriceAndFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "modules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "modules",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Features",
                table: "modules");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "modules");
        }
    }
}
