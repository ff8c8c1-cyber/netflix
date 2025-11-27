
const sql = require('msnodesqlv8');

const connectionString = "server=.\\SQLEXPRESS;Database=TienGioiDB;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

const schema = `
IF OBJECT_ID(N'[dbo].[Episodes]', 'U') IS NULL
CREATE TABLE [dbo].[Episodes](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [MovieId] [int] NOT NULL,
    [EpisodeNumber] [int] NOT NULL,
    [Title] [nvarchar](255) NULL,
    [VideoUrl] [nvarchar](500) NULL,
    [Duration] [int] DEFAULT 0,
    [CreatedAt] [datetime] DEFAULT GETDATE(),
    CONSTRAINT [PK_Episodes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Episodes_Movies] FOREIGN KEY ([MovieId]) REFERENCES [dbo].[Movies]([Id]) ON DELETE CASCADE
);
GO

IF OBJECT_ID('sp_GetMovieEpisodes', 'P') IS NOT NULL DROP PROCEDURE sp_GetMovieEpisodes
GO
CREATE PROCEDURE [dbo].[sp_GetMovieEpisodes]
    @MovieId int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM Episodes WHERE MovieId = @MovieId ORDER BY EpisodeNumber ASC;
END
GO
`;

function run() {
    console.log('Creating Episodes table...');

    const parts = schema.split('GO');
    let p = Promise.resolve();

    parts.forEach(part => {
        if (part.trim()) {
            p = p.then(() => new Promise((resolve, reject) => {
                sql.query(connectionString, part, (err) => {
                    if (err) console.error('Error:', err);
                    resolve();
                });
            }));
        }
    });

    p.then(() => console.log('Episodes table and SP created.'));
}

run();
